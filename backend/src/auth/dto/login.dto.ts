import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'sysadmin@qacoders.com' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234@Test' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
