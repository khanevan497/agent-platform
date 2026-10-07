import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest, ApprovalStatus } from './approval.entity';

@Injectable()
export class ApprovalsService {
  constructor(@InjectRepository(ApprovalRequest) private repo: Repository<ApprovalRequest>) {}

  async findPending(organizationId: string): Promise<ApprovalRequest[]> {
    return this.repo.createQueryBuilder('a')
      .innerJoin('agent_executions', 'e', 'e.id = a.executionId')
      .where('e.organizationId = :organizationId', { organizationId })
      .andWhere('a.status = :status', { status: ApprovalStatus.PENDING })
      .orderBy('a.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<ApprovalRequest> {
    const approval = await this.repo.findOne({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found');
    return approval;
  }

  async create(data: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const approval = this.repo.create(data);
    return this.repo.save(approval);
  }

  async approve(id: string, userId: string, notes?: string): Promise<ApprovalRequest> {
    const approval = await this.findById(id);
    approval.status = ApprovalStatus.APPROVED;
    approval.reviewedById = userId;
    approval.notes = notes;
    approval.reviewedAt = new Date();
    return this.repo.save(approval);
  }

  async reject(id: string, userId: string, notes?: string): Promise<ApprovalRequest> {
    const approval = await this.findById(id);
    approval.status = ApprovalStatus.REJECTED;
    approval.reviewedById = userId;
    approval.notes = notes;
    approval.reviewedAt = new Date();
    return this.repo.save(approval);
  }
}
