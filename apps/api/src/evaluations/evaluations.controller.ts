import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EvaluationsService } from './evaluations.service';
import { IsString, IsOptional } from 'class-validator';

class CreateDatasetDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

class AddCaseDto {
  @IsString() input: string;
  @IsOptional() @IsString() expectedOutput?: string;
}

class RunEvalDto {
  @IsString() agentId: string;
  @IsString() datasetId: string;
}

@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  @Get('datasets')
  findDatasets(@Request() req) {
    return this.evaluationsService.findDatasets(req.user.organizationId);
  }

  @Post('datasets')
  createDataset(@Body() body: CreateDatasetDto, @Request() req) {
    return this.evaluationsService.createDataset(req.user.organizationId, body);
  }

  @Get('datasets/:id/cases')
  findCases(@Param('id') id: string) {
    return this.evaluationsService.findCases(id);
  }

  @Post('datasets/:id/cases')
  addCase(@Param('id') id: string, @Body() body: AddCaseDto) {
    return this.evaluationsService.addCase(id, body);
  }

  @Get('results')
  findResults(@Request() req) {
    return this.evaluationsService.findResults(req.user.organizationId);
  }

  @Get('results/:id')
  findResultById(@Param('id') id: string) {
    return this.evaluationsService.findResultById(id);
  }

  @Post('run')
  run(@Body() body: RunEvalDto, @Request() req) {
    return this.evaluationsService.createResult(req.user.organizationId, body.agentId, body.datasetId);
  }
}
