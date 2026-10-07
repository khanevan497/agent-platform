import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { AgentExecution } from './execution.entity';

@Entity('tool_executions')
export class ToolExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  toolCallId: string;

  @Column()
  executionId: string;

  @ManyToOne(() => AgentExecution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'executionId' })
  execution: AgentExecution;

  @Column()
  toolName: string;

  @Column({ type: 'jsonb', default: {} })
  input: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  output: Record<string, any>;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  durationMs: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
