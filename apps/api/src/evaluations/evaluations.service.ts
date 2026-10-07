import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationDataset, EvaluationCase, EvaluationResult, EvalStatus } from './evaluation.entity';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(EvaluationDataset) private datasetRepo: Repository<EvaluationDataset>,
    @InjectRepository(EvaluationCase) private caseRepo: Repository<EvaluationCase>,
    @InjectRepository(EvaluationResult) private resultRepo: Repository<EvaluationResult>,
  ) {}

  async findDatasets(organizationId: string): Promise<EvaluationDataset[]> {
    return this.datasetRepo.find({ where: { organizationId }, order: { createdAt: 'DESC' } });
  }

  async createDataset(organizationId: string, data: Partial<EvaluationDataset>): Promise<EvaluationDataset> {
    const dataset = this.datasetRepo.create({ ...data, organizationId });
    return this.datasetRepo.save(dataset);
  }

  async addCase(datasetId: string, data: Partial<EvaluationCase>): Promise<EvaluationCase> {
    const evalCase = this.caseRepo.create({ ...data, datasetId });
    return this.caseRepo.save(evalCase);
  }

  async findCases(datasetId: string): Promise<EvaluationCase[]> {
    return this.caseRepo.find({ where: { datasetId } });
  }

  async findResults(organizationId: string): Promise<EvaluationResult[]> {
    return this.resultRepo.find({ where: { organizationId }, order: { createdAt: 'DESC' } });
  }

  async findResultById(id: string): Promise<EvaluationResult> {
    const result = await this.resultRepo.findOne({ where: { id }, relations: ['agent', 'dataset'] });
    if (!result) throw new NotFoundException('Evaluation result not found');
    return result;
  }

  async createResult(organizationId: string, agentId: string, datasetId: string): Promise<EvaluationResult> {
    const cases = await this.caseRepo.find({ where: { datasetId } });
    const result = this.resultRepo.create({
      organizationId,
      agentId,
      datasetId,
      status: EvalStatus.PENDING,
      totalCases: cases.length,
    });
    return this.resultRepo.save(result);
  }
}
