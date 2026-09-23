import { IsNumber, Max, Min } from 'class-validator';

export class CreateWeightDto {
  @IsNumber()
  @Min(1)
  @Max(300)
  weight: number;
}
