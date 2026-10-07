import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovalsService } from './approvals.service';
import { IsOptional, IsString } from 'class-validator';

class ReviewDto {
  @IsOptional() @IsString() notes?: string;
}

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Get()
  findPending(@Request() req) {
    return this.approvalsService.findPending(req.user.organizationId);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: ReviewDto, @Request() req) {
    return this.approvalsService.approve(id, req.user.id, body.notes);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: ReviewDto, @Request() req) {
    return this.approvalsService.reject(id, req.user.id, body.notes);
  }
}
