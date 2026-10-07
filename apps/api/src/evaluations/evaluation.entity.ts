import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { Agent } from '../agents/agent.entity';

export enum EvalStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('evaluation_datasets')
export class EvaluationDataset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('evaluation_cases')
export class EvaluationCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  datasetId: string;

  @ManyToOne(() => EvaluationDataset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'datasetId' })
  dataset: EvaluationDataset;

  @Column({ type: 'text' })
  input: string;

  @Column({ type: 'text', nullable: true })
  expectedOutput: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('evaluation_results')
export class EvaluationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  agentId: string;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Column()
  datasetId: string;

  @ManyToOne(() => EvaluationDataset)
  @JoinColumn({ name: 'datasetId' })
  dataset: EvaluationDataset;

  @Column({ type: 'enum', enum: EvalStatus, default: EvalStatus.PENDING })
  status: EvalStatus;

  @Column({ default: 0 })
  totalCases: number;

  @Column({ default: 0 })
  passed: number;

  @Column({ default: 0 })
  failed: number;

  @Column({ type: 'float', default: 0 })
  passRate: number;

  @Column({ type: 'jsonb', default: [] })
  results: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
