import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchFoodDto {
  @ApiProperty({
    example: 'frango',
    description: 'Termo de busca (mínimo 3 caracteres)',
  })
  @IsString({ message: 'A busca deve ser uma string.' })
  @MinLength(3, {
    message: 'A busca deve ter no mínimo 3 caracteres.',
  })
  @IsNotEmpty({ message: 'O termo de busca é obrigatório.' })
  query: string;
}
