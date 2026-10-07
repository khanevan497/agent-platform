import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { KnowledgeBase } from './knowledge-base.entity';
import { Document, DocumentStatus } from './document.entity';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeBase) private kbRepo: Repository<KnowledgeBase>,
    @InjectRepository(Document) private docRepo: Repository<Document>,
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async findAllBases(organizationId: string): Promise<KnowledgeBase[]> {
    return this.kbRepo.find({ where: { organizationId }, order: { createdAt: 'DESC' } });
  }

  async findBaseById(id: string, organizationId: string): Promise<KnowledgeBase> {
    const kb = await this.kbRepo.findOne({ where: { id, organizationId } });
    if (!kb) throw new NotFoundException('Knowledge base not found');
    return kb;
  }

  async createBase(organizationId: string, data: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    const kb = this.kbRepo.create({ ...data, organizationId });
    return this.kbRepo.save(kb);
  }

  async deleteBase(id: string, organizationId: string): Promise<void> {
    const kb = await this.findBaseById(id, organizationId);
    await this.kbRepo.remove(kb);
  }

  async findDocuments(knowledgeBaseId: string, organizationId: string): Promise<Document[]> {
    await this.findBaseById(knowledgeBaseId, organizationId);
    return this.docRepo.find({ where: { knowledgeBaseId }, order: { createdAt: 'DESC' } });
  }

  async addDocument(
    knowledgeBaseId: string,
    organizationId: string,
    title: string,
    content: string,
    documentType: any,
  ): Promise<Document> {
    await this.findBaseById(knowledgeBaseId, organizationId);
    const doc = this.docRepo.create({
      knowledgeBaseId,
      organizationId,
      title,
      documentType,
      status: DocumentStatus.PENDING,
    });
    const saved = await this.docRepo.save(doc);

    this.ingestDocument(saved.id, content).catch(err =>
      console.error(`Document ingestion failed: ${err.message}`)
    );

    return saved;
  }

  private async ingestDocument(documentId: string, content: string): Promise<void> {
    await this.docRepo.update(documentId, { status: DocumentStatus.PROCESSING });
    try {
      const engineUrl = this.config.get('AGENT_ENGINE_URL', 'http://agent-engine:8000');
      const doc = await this.docRepo.findOne({ where: { id: documentId } });
      await firstValueFrom(
        this.httpService.post(`${engineUrl}/ingest`, {
          document_id: documentId,
          knowledge_base_id: doc.knowledgeBaseId,
          content,
          title: doc.title,
          document_type: doc.documentType,
        })
      );
      await this.docRepo.update(documentId, { status: DocumentStatus.READY });
    } catch (err) {
      await this.docRepo.update(documentId, { status: DocumentStatus.FAILED, error: err.message });
    }
  }
}
