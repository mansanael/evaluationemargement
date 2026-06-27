import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SeminarsService } from './seminars.service';
import { CreateSeminarDto, UpdateSeminarDto } from './dto/create-seminar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('seminars')
export class SeminarsController {
  constructor(private seminarsService: SeminarsService) {}

  @Get()
  findAll() {
    return this.seminarsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seminarsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateSeminarDto, @CurrentUser() user: any) {
    return this.seminarsService.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateSeminarDto) {
    return this.seminarsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.seminarsService.remove(id);
  }
}
