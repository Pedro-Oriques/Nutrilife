import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

const MEAL_SESSIONS = [
  'cafe_da_manha',
  'lanche_manha',
  'almoco',
  'lanche_tarde',
  'jantar',
  'ceia',
];

const UNITS = ['g', 'kg', 'ml', 'L', 'mg', 'mcg'];

export class AddFoodEntryDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID MongoDB do alimento',
  })
  @IsMongoId({
    message: 'O ID do alimento deve ser um MongoDB ObjectId válido.',
  })
  @IsNotEmpty({ message: 'O ID do alimento é obrigatório.' })
  foodId: string;

  @ApiProperty({
    example: 150,
    description: 'Quantidade do alimento (máximo 9999)',
  })
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade deve ser no mínimo 1.' })
  @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
  quantity: number;

  @ApiProperty({
    example: 'g',
    description: 'Unidade de medida (g, kg, ml, L, mg, mcg)',
    enum: UNITS,
  })
  @IsEnum(UNITS, {
    message: 'A unidade deve ser uma das seguintes: g, kg, ml, L, mg, mcg.',
  })
  @IsNotEmpty({ message: 'A unidade é obrigatória.' })
  unit: string;

  @ApiProperty({
    example: 'almoco',
    description:
      'Sessão da refeição (cafe_da_manha, lanche_manha, almoco, lanche_tarde, jantar, ceia)',
    enum: MEAL_SESSIONS,
  })
  @IsEnum(MEAL_SESSIONS, {
    message:
      'A sessão de refeição deve ser uma das seguintes: cafe_da_manha, lanche_manha, almoco, lanche_tarde, jantar, ceia.',
  })
  @IsNotEmpty({ message: 'A sessão de refeição é obrigatória.' })
  mealSession: string;

  @ApiPropertyOptional({
    example: '2025-02-13T10:30:00Z',
    description: 'Data e hora da refeição (ISO 8601). Padrão: data/hora atual.',
  })
  @IsOptional()
  date?: string;
}
