import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToolsService } from './tools.service';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

class CreateToolDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsObject()
  inputSchema?: Record<string, any>;

  @IsOptional() @IsObject()
  outputSchema?: Record<string, any>;

  @IsOptional() @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional() @IsString()
  endpoint?: string;

  @IsOptional() @IsObject()
  config?: Record<string, any>;
}

@Controller('tools')
@UseGuards(JwtAuthGuard)
export class ToolsController {
  constructor(private toolsService: ToolsService) {}

  @Get()
  findAll(@Request() req) {
    return this.toolsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.toolsService.findById(id, req.user.organizationId);
  }

  @Post()
  create(@Body() body: CreateToolDto, @Request() req) {
    return this.toolsService.create(req.user.organizationId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateToolDto>, @Request() req) {
    return this.toolsService.update(id, req.user.organizationId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.toolsService.remove(id, req.user.organizationId);
  }
}
