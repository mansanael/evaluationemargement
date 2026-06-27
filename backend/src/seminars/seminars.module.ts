import { Module } from '@nestjs/common';
import { SeminarsService } from './seminars.service';
import { SeminarsController } from './seminars.controller';

@Module({
  providers: [SeminarsService],
  controllers: [SeminarsController],
})
export class SeminarsModule {}
