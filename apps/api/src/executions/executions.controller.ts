import { Controller, Get, Post, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionsService } from './executions.service';
import { IsString, IsOptional } from 'class-validator';

class CreateExecutionDto {
  @IsString()
  agentId: string;

  @IsString()
  input: string;
}

@Controller('executions')
@UseGuards(JwtAuthGuard)
export class ExecutionsController {
  constructor(private executionsService: ExecutionsService) {}

  @Get()
  findAll(@Request() req, @Query('agentId') agentId?: string) {
    return this.executionsService.findAll(req.user.organizationId, agentId);
  }

  @Get('metrics')
  getMetrics(@Request() req) {
    return this.executionsService.getMetrics(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.executionsService.findById(id, req.user.organizationId);
  }

  @Post()
  create(@Body() body: CreateExecutionDto, @Request() req) {
    return this.executionsService.create(
      body.agentId,
      req.user.id,
      req.user.organizationId,
      body.input,
    );
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.executionsService.cancel(id, req.user.organizationId);
  }
}
