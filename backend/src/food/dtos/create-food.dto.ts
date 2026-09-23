import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const FOOD_RESTRICTIONS = [
  'Sem restrições',
  'Celíaco',
  'Vegano',
  'Vegetariano',
  'Colesterol alto',
];

export class CreateFoodDto {
  @ApiProperty({ example: 'Frango grelhado', description: 'Nome do alimento' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name: string;

  @ApiProperty({ example: 165, description: 'Calorias por 100g do alimento' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Calorias deve ser um número com até 2 casas decimais.' },
  )
  @Min(0, { message: 'Calorias não pode ser negativo.' })
  @IsNotEmpty({ message: 'Calorias é obrigatório.' })
  caloriesPer100g: number;

  @ApiPropertyOptional({
    example: 31,
    description: 'Proteínas em gramas por 100g',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Proteína deve ser um número com até 2 casas decimais.' },
  )
  @Min(0, { message: 'Proteína não pode ser negativo.' })
  @IsOptional()
  protein?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Carboidratos em gramas por 100g',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Carboidrato deve ser um número com até 2 casas decimais.' },
  )
  @Min(0, { message: 'Carboidrato não pode ser negativo.' })
  @IsOptional()
  carbs?: number;

  @ApiPropertyOptional({
    example: 3.6,
    description: 'Gorduras em gramas por 100g',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Gordura deve ser um número com até 2 casas decimais.' },
  )
  @Min(0, { message: 'Gordura não pode ser negativo.' })
  @IsOptional()
  fat?: number;

  @ApiPropertyOptional({
    isArray: true,
    enum: FOOD_RESTRICTIONS,
    description: 'Restrições alimentares atendidas por este alimento',
  })
  @IsArray()
  @IsEnum(FOOD_RESTRICTIONS, {
    each: true,
    message: 'Restrição alimentar inválida.',
  })
  @IsOptional()
  foodRestrictions?: string[];
}
