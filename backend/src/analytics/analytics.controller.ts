import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  getGlobal() {
    return this.analyticsService.getGlobal();
  }

  @Get('seminars/:seminarId')
  getForSeminar(@Param('seminarId') seminarId: string) {
    return this.analyticsService.getForSeminar(seminarId);
  }
}
