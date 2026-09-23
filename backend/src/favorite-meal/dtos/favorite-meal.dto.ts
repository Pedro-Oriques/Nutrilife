import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
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

export class FavoriteFoodItemDto {
  @IsMongoId()
  @IsNotEmpty()
  foodId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsEnum(UNITS)
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  calories: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;
}

export class CreateFavoriteMealDto {
  @ApiProperty({ example: 'Café da Manhã #01' })
  @IsString()
  @IsNotEmpty({ message: 'O título da refeição é obrigatório.' })
  title: string;

  @ApiProperty({ example: 'cafe_da_manha', enum: MEAL_SESSIONS })
  @IsEnum(MEAL_SESSIONS, { message: 'Sessão de refeição inválida.' })
  @IsNotEmpty()
  mealSession: string;

  @ApiProperty({ type: [FavoriteFoodItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FavoriteFoodItemDto)
  foods: FavoriteFoodItemDto[];
}

export class ApplyFavoriteMealDto {
  @ApiProperty({
    example: '2025-10-15',
    description: 'Data para registrar a refeição',
  })
  @IsString()
  @IsNotEmpty({ message: 'A data é obrigatória.' })
  date: string;
}
