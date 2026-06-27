import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, isAbsolute } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SeminarsModule } from './seminars/seminars.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { ResourcesModule } from './resources/resources.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: (() => {
        const d = process.env.UPLOAD_DIR || './uploads';
        return isAbsolute(d) ? d : join(process.cwd(), d);
      })(),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SeminarsModule,
    AttendanceModule,
    EvaluationsModule,
    ResourcesModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
