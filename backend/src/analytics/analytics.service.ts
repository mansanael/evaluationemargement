import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function count(arr: string[], val: string) {
  return arr.filter((v) => v === val).length;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getForSeminar(seminarId: string) {
    const seminar = await this.prisma.seminar.findUnique({
      where: { id: seminarId },
      include: { _count: { select: { attendances: true } } },
    });
    if (!seminar) throw new NotFoundException('Séminaire introuvable');

    const evals = await this.prisma.evaluation.findMany({ where: { seminarId } });
    const total = evals.length;

    if (total === 0) {
      return { seminarId, totalEvaluations: 0, totalAttendances: seminar._count.attendances };
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const dist = (field: keyof typeof evals[0]) => {
      const values = evals.map((e) => e[field] as string);
      return [...new Set(values)].map((v) => ({ label: v, count: count(values, v) }));
    };

    return {
      seminarId,
      totalEvaluations: total,
      totalAttendances: seminar._count.attendances,
      satisfactionMoyenne: avg(evals.map((e) => e.satisfactionGlobale)),
      tauxRecommandation: (evals.filter((e) => e.recommandation).length / total) * 100,
      pertinence: dist('pertinence'),
      objectifsAtteints: dist('objectifsAtteints'),
      niveauAdaptation: dist('niveauAdaptation'),
      methodeEfficace: dist('methodeEfficace'),
      maitriseSujet: dist('maitriseSujet'),
      participationEncouragee: dist('participationEncouragee'),
      rythme: dist('rythme'),
      logistique: dist('logistique'),
      supportsClairs: dist('supportsClairs'),
      competencesAcquises: dist('competencesAcquises'),
      commentaires: {
        themes: evals.filter((e) => e.themesCommentaire).map((e) => e.themesCommentaire),
        ameliorations: evals.filter((e) => e.ameliorationsOrganisation).map((e) => e.ameliorationsOrganisation),
        plusAppreciee: evals.filter((e) => e.plusAppreciee).map((e) => e.plusAppreciee),
        pointsAmeliorer: evals.filter((e) => e.pointsAmeliorer).map((e) => e.pointsAmeliorer),
      },
    };
  }

  async getGlobal() {
    const seminars = await this.prisma.seminar.findMany({
      include: { _count: { select: { attendances: true, evaluations: true } } },
    });

    const evals = await this.prisma.evaluation.findMany();
    const total = evals.length;
    const avgSatisfaction = total
      ? evals.reduce((a, e) => a + e.satisfactionGlobale, 0) / total
      : 0;

    return {
      totalSeminars: seminars.length,
      totalAttendances: seminars.reduce((a, s) => a + s._count.attendances, 0),
      totalEvaluations: total,
      satisfactionMoyenne: avgSatisfaction,
      tauxRecommandation: total
        ? (evals.filter((e) => e.recommandation).length / total) * 100
        : 0,
      seminars: seminars.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date,
        attendances: s._count.attendances,
        evaluations: s._count.evaluations,
      })),
    };
  }
}
