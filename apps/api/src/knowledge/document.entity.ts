import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KnowledgeBase } from './knowledge-base.entity';
import { Organization } from '../organizations/organization.entity';

export enum DocumentType {
  MARKDOWN = 'markdown',
  TXT = 'txt',
  PDF = 'pdf',
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  knowledgeBaseId: string;

  @ManyToOne(() => KnowledgeBase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledgeBaseId' })
  knowledgeBase: KnowledgeBase;

  @Column()
  title: string;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.TXT })
  documentType: DocumentType;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Column({ default: 0 })
  chunkCount: number;

  @Column({ nullable: true, type: 'text' })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
