import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeminarDto, UpdateSeminarDto } from './dto/create-seminar.dto';

@Injectable()
export class SeminarsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.seminar.findMany({
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { attendances: true, evaluations: true, resources: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const seminar = await this.prisma.seminar.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { attendances: true, evaluations: true, resources: true } },
      },
    });
    if (!seminar) throw new NotFoundException('Séminaire introuvable');
    return seminar;
  }

  create(dto: CreateSeminarDto, creatorId: string) {
    return this.prisma.seminar.create({
      data: { ...dto, date: new Date(dto.date), creatorId },
    });
  }

  async update(id: string, dto: UpdateSeminarDto) {
    await this.findOne(id);
    return this.prisma.seminar.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.seminar.delete({ where: { id } });
  }
}
