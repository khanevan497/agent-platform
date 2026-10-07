import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { firstValueFrom } from 'rxjs';
import { AgentExecution, ExecutionStatus } from './execution.entity';
import { AgentsService } from '../agents/agents.service';
import { ToolsService } from '../tools/tools.service';

@Processor('executions')
export class ExecutionProcessor {
  private readonly logger = new Logger(ExecutionProcessor.name);

  constructor(
    @InjectRepository(AgentExecution) private execRepo: Repository<AgentExecution>,
    private agentsService: AgentsService,
    private toolsService: ToolsService,
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  @Process('run')
  async handleRun(job: Job<{ executionId: string }>) {
    const { executionId } = job.data;
    const execution = await this.execRepo.findOne({ where: { id: executionId } });
    if (!execution) return;

    execution.status = ExecutionStatus.RUNNING;
    await this.execRepo.save(execution);

    const startTime = Date.now();

    try {
      const agent = await this.agentsService.findById(execution.agentId, execution.organizationId);
      const agentTools = await this.agentsService.getTools(execution.agentId, execution.organizationId);
      const tools = agentTools.map(at => at.tool).filter(Boolean);

      const engineUrl = this.config.get('AGENT_ENGINE_URL', 'http://agent-engine:8000');

      const response = await firstValueFrom(
        this.httpService.post(`${engineUrl}/execute`, {
          execution_id: executionId,
          agent: {
            id: agent.id,
            name: agent.name,
            system_prompt: agent.systemPrompt,
            model: agent.model,
            temperature: agent.temperature,
            max_steps: agent.maxSteps,
            max_tokens: agent.maxTokens,
          },
          input: execution.input,
          tools: tools.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            input_schema: t.inputSchema,
            requires_approval: t.requiresApproval,
            endpoint: t.endpoint,
            config: t.config,
          })),
        }, { timeout: 300000 }),
      );

      const result = response.data;
      const duration = Date.now() - startTime;

      execution.status = result.status === 'completed' ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED;
      execution.output = result.output;
      execution.stepCount = result.step_count || 0;
      execution.tokenUsage = result.token_usage || {};
      execution.estimatedCost = result.estimated_cost || 0;
      execution.trace = result.trace || [];
      execution.completedAt = new Date();
      execution.durationMs = duration;
      if (result.error) execution.error = result.error;

      await this.execRepo.save(execution);
    } catch (err) {
      this.logger.error(`Execution ${executionId} failed: ${err.message}`);
      execution.status = ExecutionStatus.FAILED;
      execution.error = err.message;
      execution.completedAt = new Date();
      execution.durationMs = Date.now() - startTime;
      await this.execRepo.save(execution);
    }
  }
}
