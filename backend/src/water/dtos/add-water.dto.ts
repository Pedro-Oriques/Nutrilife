import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddWaterDto {
  @ApiProperty({
    example: '2026-03-09',
    description: 'Data do registro (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: 250,
    description: 'Quantidade de água em ml (positivo para adicionar, negativo para subtrair)',
  })
  @IsNumber()
  @IsNotEmpty()
  amountMl: number;
}
