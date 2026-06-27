import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findBySeminar(seminarId: string) {
    await this.ensureSeminar(seminarId);
    return this.prisma.attendance.findMany({
      where: { seminarId },
      include: { user: { select: { id: true, name: true, poste: true } } },
      orderBy: { signedAt: 'asc' },
    });
  }

  async create(seminarId: string, dto: CreateAttendanceDto, userId?: string) {
    await this.ensureSeminar(seminarId);

    const signedAt = dto.signedAt ? new Date(dto.signedAt) : new Date();

    if (userId) {
      const startOfDay = new Date(signedAt);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(signedAt);
      endOfDay.setHours(23, 59, 59, 999);

      const already = await this.prisma.attendance.findFirst({
        where: { seminarId, userId, signedAt: { gte: startOfDay, lte: endOfDay } },
      });
      if (already) throw new BadRequestException('Vous avez déjà émargé pour ce séminaire ce jour-là');
    }

    const { signedAt: _ignored, ...rest } = dto;
    return this.prisma.attendance.create({
      data: { seminarId, userId, signedAt, ...rest },
      include: { user: { select: { id: true, name: true, poste: true } } },
    });
  }

  async remove(id: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException('Émargement introuvable');
    return this.prisma.attendance.delete({ where: { id } });
  }

  private async ensureSeminar(seminarId: string) {
    const seminar = await this.prisma.seminar.findUnique({ where: { id: seminarId } });
    if (!seminar) throw new NotFoundException('Séminaire introuvable');
    return seminar;
  }
}
