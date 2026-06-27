import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  signatureData: string;

  @IsString()
  @IsOptional()
  guestName?: string;

  @IsString()
  @IsOptional()
  guestPoste?: string;

  @IsDateString()
  @IsOptional()
  signedAt?: string;
}
