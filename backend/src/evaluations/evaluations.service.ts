import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  async findBySeminar(seminarId: string) {
    await this.ensureSeminar(seminarId);
    return this.prisma.evaluation.findMany({
      where: { seminarId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async create(seminarId: string, dto: CreateEvaluationDto, userId?: string) {
    await this.ensureSeminar(seminarId);
    return this.prisma.evaluation.create({
      data: { seminarId, userId, ...dto },
    });
  }

  private async ensureSeminar(seminarId: string) {
    const seminar = await this.prisma.seminar.findUnique({ where: { id: seminarId } });
    if (!seminar) throw new NotFoundException('Séminaire introuvable');
    return seminar;
  }
}
