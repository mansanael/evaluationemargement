import {
  Controller, Get, Post, Delete, Param, Body, UseGuards,
  UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

class AddLinkDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() url: string;
}

@Controller('seminars/:seminarId/resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Get()
  findAll(@Param('seminarId') seminarId: string) {
    return this.resourcesService.findBySeminar(seminarId);
  }

  @Post('link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  addLink(@Param('seminarId') seminarId: string, @Body() dto: AddLinkDto) {
    return this.resourcesService.createLink(seminarId, dto.name, dto.url);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(
    @Param('seminarId') seminarId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = `/uploads/${file.filename}`;
    return this.resourcesService.createFile(seminarId, file.originalname, url, file.size);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
