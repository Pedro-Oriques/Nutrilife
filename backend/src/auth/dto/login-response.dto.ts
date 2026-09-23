import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1Ni...' })
  token: string;

  @ApiProperty({
    example: {
      username: 'Carlos Silva',
      id: '6971552395e84eb5062e1e2f',
    },
  })
  payload: {
    username: string;
    id: string;
  };

  @ApiProperty({ example: 'Autenticado com sucesso' })
  msg: string;
}
