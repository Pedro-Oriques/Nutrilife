import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class GetReportDto {
  @ApiProperty({
    example: '2025-10-01',
    description: 'Data inicial do período (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'A data inicial é obrigatória.' })
  @IsDateString(
    {},
    { message: 'A data inicial deve estar num formato válido (YYYY-MM-DD).' },
  )
  startDate: string;

  @ApiProperty({
    example: '2025-10-15',
    description: 'Data final do período (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'A data final é obrigatória.' })
  @IsDateString(
    {},
    { message: 'A data final deve estar num formato válido (YYYY-MM-DD).' },
  )
  endDate: string;

  @ApiPropertyOptional({ example: 1, description: 'Página atual' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de registros por página (5, 10, 20, 30, 50)',
    enum: [5, 10, 20, 30, 50],
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([5, 10, 20, 30, 50], {
    message:
      'A quantidade de registros por página deve ser 5, 10, 20, 30 ou 50.',
  })
  limit?: number = 10;
}
