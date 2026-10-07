import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../organizations/organization.entity';

@Entity('tools')
export class Tool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: {} })
  inputSchema: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  outputSchema: Record<string, any>;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ default: true })
  enabled: boolean;

  @Column({ nullable: true })
  endpoint: string;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
