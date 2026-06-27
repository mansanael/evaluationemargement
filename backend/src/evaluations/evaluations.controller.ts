import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('seminars/:seminarId/evaluations')
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Param('seminarId') seminarId: string) {
    return this.evaluationsService.findBySeminar(seminarId);
  }

  @Post()
  async create(
    @Param('seminarId') seminarId: string,
    @Body() dto: CreateEvaluationDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.evaluationsService.create(seminarId, dto, userId);
  }
}
