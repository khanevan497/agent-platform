import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';
import { IsString, IsOptional } from 'class-validator';

class CreateKBDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

class AddDocumentDto {
  @IsString() title: string;
  @IsString() content: string;
  @IsOptional() @IsString() documentType?: string;
}

@Controller('knowledge-bases')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Get()
  findAll(@Request() req) {
    return this.knowledgeService.findAllBases(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.knowledgeService.findBaseById(id, req.user.organizationId);
  }

  @Post()
  create(@Body() body: CreateKBDto, @Request() req) {
    return this.knowledgeService.createBase(req.user.organizationId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.knowledgeService.deleteBase(id, req.user.organizationId);
  }

  @Get(':id/documents')
  findDocuments(@Param('id') id: string, @Request() req) {
    return this.knowledgeService.findDocuments(id, req.user.organizationId);
  }

  @Post(':id/documents')
  addDocument(@Param('id') id: string, @Body() body: AddDocumentDto, @Request() req) {
    return this.knowledgeService.addDocument(
      id,
      req.user.organizationId,
      body.title,
      body.content,
      body.documentType || 'txt',
    );
  }
}
