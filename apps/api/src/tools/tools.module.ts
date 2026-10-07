import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './tool.entity';
import { AgentTool } from './agent-tool.entity';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tool, AgentTool])],
  providers: [ToolsService],
  controllers: [ToolsController],
  exports: [ToolsService],
})
export class ToolsModule {}
