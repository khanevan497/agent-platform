import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { AgentExecution } from './execution.entity';
import { ToolExecution } from './tool-execution.entity';
import { ExecutionsService } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { ExecutionProcessor } from './execution.processor';
import { AgentsModule } from '../agents/agents.module';
import { ToolsModule } from '../tools/tools.module';
import { ApprovalsModule } from '../approvals/approvals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentExecution, ToolExecution]),
    BullModule.registerQueue({ name: 'executions' }),
    HttpModule,
    AgentsModule,
    ToolsModule,
    ApprovalsModule,
  ],
  providers: [ExecutionsService, ExecutionProcessor],
  controllers: [ExecutionsController],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}
