import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgentsService } from './agents.service';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { AgentStatus } from './agent.entity';

class CreateAgentDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  systemPrompt?: string;

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsNumber()
  temperature?: number;

  @IsOptional() @IsNumber()
  maxSteps?: number;

  @IsOptional() @IsNumber()
  maxTokens?: number;
}

class SetToolsDto {
  @IsArray()
  toolIds: string[];
}

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Get()
  findAll(@Request() req) {
    return this.agentsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.agentsService.findById(id, req.user.organizationId);
  }

  @Post()
  create(@Body() body: CreateAgentDto, @Request() req) {
    return this.agentsService.create(req.user.organizationId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateAgentDto>, @Request() req) {
    return this.agentsService.update(id, req.user.organizationId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.agentsService.remove(id, req.user.organizationId);
  }

  @Get(':id/tools')
  getTools(@Param('id') id: string, @Request() req) {
    return this.agentsService.getTools(id, req.user.organizationId);
  }

  @Post(':id/tools')
  setTools(@Param('id') id: string, @Body() body: SetToolsDto, @Request() req) {
    return this.agentsService.setTools(id, req.user.organizationId, body.toolIds);
  }
}
