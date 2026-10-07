import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './agent.entity';
import { AgentTool } from '../tools/agent-tool.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent) private agentRepo: Repository<Agent>,
    @InjectRepository(AgentTool) private agentToolRepo: Repository<AgentTool>,
  ) {}

  async findAll(organizationId: string): Promise<Agent[]> {
    return this.agentRepo.find({ where: { organizationId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string, organizationId: string): Promise<Agent> {
    const agent = await this.agentRepo.findOne({ where: { id, organizationId } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async create(organizationId: string, data: Partial<Agent>): Promise<Agent> {
    const agent = this.agentRepo.create({ ...data, organizationId });
    return this.agentRepo.save(agent);
  }

  async update(id: string, organizationId: string, data: Partial<Agent>): Promise<Agent> {
    const agent = await this.findById(id, organizationId);
    Object.assign(agent, data);
    return this.agentRepo.save(agent);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const agent = await this.findById(id, organizationId);
    await this.agentRepo.remove(agent);
  }

  async getTools(agentId: string, organizationId: string): Promise<AgentTool[]> {
    await this.findById(agentId, organizationId);
    return this.agentToolRepo.find({
      where: { agentId },
      relations: ['tool'],
    });
  }

  async setTools(agentId: string, organizationId: string, toolIds: string[]): Promise<AgentTool[]> {
    await this.findById(agentId, organizationId);
    await this.agentToolRepo.delete({ agentId });
    const agentTools = toolIds.map(toolId => this.agentToolRepo.create({ agentId, toolId }));
    return this.agentToolRepo.save(agentTools);
  }
}
