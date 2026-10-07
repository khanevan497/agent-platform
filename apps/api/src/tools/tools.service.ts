import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tool } from './tool.entity';

@Injectable()
export class ToolsService {
  constructor(@InjectRepository(Tool) private repo: Repository<Tool>) {}

  async findAll(organizationId: string): Promise<Tool[]> {
    return this.repo.find({ where: { organizationId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string, organizationId: string): Promise<Tool> {
    const tool = await this.repo.findOne({ where: { id, organizationId } });
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  async findByIds(ids: string[], organizationId: string): Promise<Tool[]> {
    return this.repo.createQueryBuilder('tool')
      .where('tool.id IN (:...ids)', { ids })
      .andWhere('tool.organizationId = :organizationId', { organizationId })
      .getMany();
  }

  async create(organizationId: string, data: Partial<Tool>): Promise<Tool> {
    const tool = this.repo.create({ ...data, organizationId });
    return this.repo.save(tool);
  }

  async update(id: string, organizationId: string, data: Partial<Tool>): Promise<Tool> {
    const tool = await this.findById(id, organizationId);
    Object.assign(tool, data);
    return this.repo.save(tool);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const tool = await this.findById(id, organizationId);
    await this.repo.remove(tool);
  }
}
