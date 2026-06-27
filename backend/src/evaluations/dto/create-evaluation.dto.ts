import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  poste?: string;

  // Partie 2
  @IsString()
  @IsNotEmpty()
  pertinence: string;

  @IsString()
  @IsNotEmpty()
  objectifsAtteints: string;

  @IsString()
  @IsNotEmpty()
  niveauAdaptation: string;

  @IsString()
  @IsOptional()
  themesCommentaire?: string;

  // Partie 3
  @IsString()
  @IsNotEmpty()
  methodeEfficace: string;

  @IsString()
  @IsNotEmpty()
  maitriseSujet: string;

  @IsString()
  @IsNotEmpty()
  participationEncouragee: string;

  @IsString()
  @IsNotEmpty()
  rythme: string;

  // Partie 4
  @IsString()
  @IsNotEmpty()
  logistique: string;

  @IsString()
  @IsNotEmpty()
  supportsClairs: string;

  @IsString()
  @IsOptional()
  ameliorationsOrganisation?: string;

  // Partie 5
  @IsString()
  @IsNotEmpty()
  competencesAcquises: string;

  @IsBoolean()
  recommandation: boolean;

  @IsInt()
  @Min(1)
  @Max(10)
  satisfactionGlobale: number;

  // Partie 6
  @IsString()
  @IsOptional()
  plusAppreciee?: string;

  @IsString()
  @IsOptional()
  pointsAmeliorer?: string;
}
