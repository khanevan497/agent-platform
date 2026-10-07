import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { AgentExecution, ExecutionStatus } from './execution.entity';
import { ToolExecution } from './tool-execution.entity';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(AgentExecution) private execRepo: Repository<AgentExecution>,
    @InjectRepository(ToolExecution) private toolExecRepo: Repository<ToolExecution>,
    @InjectQueue('executions') private execQueue: Queue,
    private agentsService: AgentsService,
  ) {}

  async create(agentId: string, userId: string, organizationId: string, input: string): Promise<AgentExecution> {
    await this.agentsService.findById(agentId, organizationId);

    const execution = this.execRepo.create({
      agentId,
      userId,
      organizationId,
      input,
      status: ExecutionStatus.PENDING,
    });
    const saved = await this.execRepo.save(execution);

    await this.execQueue.add('run', { executionId: saved.id }, {
      attempts: 1,
      removeOnComplete: false,
    });

    return saved;
  }

  async findAll(organizationId: string, agentId?: string): Promise<AgentExecution[]> {
    const where: any = { organizationId };
    if (agentId) where.agentId = agentId;
    return this.execRepo.find({ where, order: { startedAt: 'DESC' }, take: 100 });
  }

  async findById(id: string, organizationId: string): Promise<AgentExecution> {
    const exec = await this.execRepo.findOne({ where: { id, organizationId }, relations: ['agent'] });
    if (!exec) throw new NotFoundException('Execution not found');
    return exec;
  }

  async cancel(id: string, organizationId: string): Promise<AgentExecution> {
    const exec = await this.findById(id, organizationId);
    if (exec.status !== ExecutionStatus.RUNNING && exec.status !== ExecutionStatus.PENDING) {
      throw new ForbiddenException('Can only cancel running or pending executions');
    }
    exec.status = ExecutionStatus.CANCELLED;
    exec.completedAt = new Date();
    return this.execRepo.save(exec);
  }

  async update(id: string, data: Partial<AgentExecution>): Promise<AgentExecution> {
    await this.execRepo.update(id, data as any);
    return this.execRepo.findOne({ where: { id } });
  }

  async getMetrics(organizationId: string) {
    const total = await this.execRepo.count({ where: { organizationId } });
    const completed = await this.execRepo.count({ where: { organizationId, status: ExecutionStatus.COMPLETED } });
    const failed = await this.execRepo.count({ where: { organizationId, status: ExecutionStatus.FAILED } });
    const running = await this.execRepo.count({ where: { organizationId, status: ExecutionStatus.RUNNING } });

    const result = await this.execRepo.createQueryBuilder('e')
      .select('AVG(e.durationMs)', 'avgLatency')
      .addSelect('SUM((e.tokenUsage->>\'total_tokens\')::numeric)', 'totalTokens')
      .addSelect('SUM(e.estimatedCost)', 'totalCost')
      .where('e.organizationId = :organizationId', { organizationId })
      .andWhere('e.status = :status', { status: ExecutionStatus.COMPLETED })
      .getRawOne();

    return {
      total,
      completed,
      failed,
      running,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgLatency: Math.round(result?.avgLatency || 0),
      totalTokens: parseInt(result?.totalTokens || '0'),
      totalCost: parseFloat(result?.totalCost || '0').toFixed(4),
    };
  }
}
