import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../organizations/organization.entity';

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('agents')
export class Agent {
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

  @Column({ type: 'text', nullable: true })
  systemPrompt: string;

  @Column({ default: 'claude-sonnet-4-6' })
  model: string;

  @Column({ type: 'float', default: 0.7 })
  temperature: number;

  @Column({ default: 8 })
  maxSteps: number;

  @Column({ default: 4096 })
  maxTokens: number;

  @Column({ type: 'enum', enum: AgentStatus, default: AgentStatus.DRAFT })
  status: AgentStatus;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
