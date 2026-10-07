import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { Agent } from '../agents/agent.entity';
import { User } from '../users/user.entity';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  MAX_STEPS_EXCEEDED = 'max_steps_exceeded',
  AWAITING_APPROVAL = 'awaiting_approval',
}

@Entity('agent_executions')
export class AgentExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  agentId: string;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @Column({ type: 'text' })
  input: string;

  @Column({ type: 'text', nullable: true })
  output: string;

  @Column({ default: 0 })
  stepCount: number;

  @Column({ type: 'jsonb', default: {} })
  tokenUsage: Record<string, any>;

  @Column({ type: 'float', default: 0 })
  estimatedCost: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'jsonb', default: [] })
  trace: any[];

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  durationMs: number;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
