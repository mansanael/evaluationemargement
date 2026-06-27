import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('seminars/:seminarId/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Param('seminarId') seminarId: string) {
    return this.attendanceService.findBySeminar(seminarId);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Param('seminarId') seminarId: string,
    @Body() dto: CreateAttendanceDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.attendanceService.create(seminarId, dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
