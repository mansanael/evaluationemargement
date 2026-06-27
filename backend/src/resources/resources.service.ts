import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findBySeminar(seminarId: string) {
    await this.ensureSeminar(seminarId);
    return this.prisma.resource.findMany({
      where: { seminarId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLink(seminarId: string, name: string, url: string) {
    await this.ensureSeminar(seminarId);
    return this.prisma.resource.create({
      data: { seminarId, name, type: 'LINK', url },
    });
  }

  async createFile(seminarId: string, name: string, url: string, size: number) {
    await this.ensureSeminar(seminarId);
    return this.prisma.resource.create({
      data: { seminarId, name, type: 'FILE', url, size },
    });
  }

  async remove(id: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException('Ressource introuvable');
    return this.prisma.resource.delete({ where: { id } });
  }

  private async ensureSeminar(seminarId: string) {
    const seminar = await this.prisma.seminar.findUnique({ where: { id: seminarId } });
    if (!seminar) throw new NotFoundException('Séminaire introuvable');
    return seminar;
  }
}
