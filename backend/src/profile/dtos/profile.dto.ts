import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsOptional,
  MaxDate,
  IsPositive,
  ArrayNotEmpty,
} from 'class-validator';

export const FOOD_RESTRICTIONS = [
  'Sem restrições',
  'Celíaco',
  'Vegano',
  'Vegetariano',
  'Colesterol alto',
];

export const PHYSICAL_ACTIVITIES = [
  'Sedentário',
  'Pouco ativo',
  'Ativo',
  'Muito Ativo',
  'Extremamente Ativo',
];

export class CreateProfileDto {
  @ApiProperty({
    example: '1995-12-25',
    description: 'Data de nascimento (DD/MM/AAAA no front, ISO no back)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Informe uma data válida no formato DD/MM/AAAA.' })
  @MaxDate(() => new Date(), {
    message: 'A data de nascimento não pode ser futura.',
  })
  @IsNotEmpty({ message: 'O campo Data de nascimento é obrigatório.' })
  birthDate: Date;

  @ApiProperty({ example: 175, description: 'Altura em cm (1-300)' })
  @IsNumber({}, { message: 'A altura deve ser um número válido.' })
  @IsPositive({
    message: 'O valor informado no campo Altura deve ser maior que zero.',
  })
  @Min(1, { message: 'A Altura deve estar entre 1 e 300 cm.' })
  @Max(300, { message: 'A Altura deve estar entre 1 e 300 cm.' })
  @IsNotEmpty({ message: 'O campo Altura é obrigatório.' })
  height: number;

  @ApiProperty({ example: 72.5, description: 'Peso em kg (1-300)' })
  @IsNumber({}, { message: 'O peso deve ser um número válido.' })
  @IsPositive({
    message: 'O valor informado no campo Peso deve ser maior que zero.',
  })
  @Min(1, { message: 'O Peso deve estar entre 1 e 300 kg.' })
  @Max(300, { message: 'O Peso deve estar entre 1 e 300 kg.' })
  @IsNotEmpty({ message: 'O campo Peso é obrigatório.' })
  weight: number;

  @ApiProperty({ enum: ['Feminino', 'Masculino'] })
  @IsEnum(['Feminino', 'Masculino'], {
    message: 'O campo Sexo é obrigatório.',
  })
  @IsNotEmpty({ message: 'O campo Sexo é obrigatório.' })
  gender: string;

  @ApiProperty({
    isArray: true,
    enum: FOOD_RESTRICTIONS,
    description: 'Restrições alimentares do usuário',
  })
  @IsArray({ message: 'O campo Restrição Alimentar é obrigatório.' })
  @ArrayNotEmpty({ message: 'O campo Restrição Alimentar é obrigatório.' })
  @IsEnum(FOOD_RESTRICTIONS, {
    each: true,
    message: 'Opção de restrição alimentar inválida selecionada.',
  })
  foodRestrictions: string[];

  @ApiPropertyOptional({
    isArray: true,
    description: 'Outros alimentos (Dropdown)',
  })
  @IsArray()
  @IsOptional()
  otherFoods?: string[];

  @ApiProperty({
    example: 'Sedentário',
    enum: PHYSICAL_ACTIVITIES,
    description: 'Nível de atividade física',
  })
  @IsEnum(PHYSICAL_ACTIVITIES, {
    message: 'O campo Nível de Atividade Física é obrigatório.',
  })
  @IsNotEmpty({ message: 'O campo Nível de Atividade Física é obrigatório.' })
  physicalActivity: string;

  @ApiProperty({ enum: ['Perda de peso', 'Ganho de massa', 'Manter saúde'] })
  @IsEnum(['Perda de peso', 'Ganho de massa', 'Manter saúde'], {
    message: 'Selecione um objetivo válido.',
  })
  @IsNotEmpty({ message: 'Objetivo é obrigatório.' })
  goal: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Aceite de uso de dados (LGPD)',
  })
  @IsOptional()
  lgpdConsent?: boolean;
}
