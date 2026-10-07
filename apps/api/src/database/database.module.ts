import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Agent } from '../agents/agent.entity';
import { Tool } from '../tools/tool.entity';
import { AgentTool } from '../tools/agent-tool.entity';
import { KnowledgeBase } from '../knowledge/knowledge-base.entity';
import { Document } from '../knowledge/document.entity';
import { EvaluationDataset, EvaluationCase } from '../evaluations/evaluation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization, User, Agent, Tool, AgentTool,
      KnowledgeBase, Document, EvaluationDataset, EvaluationCase,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
