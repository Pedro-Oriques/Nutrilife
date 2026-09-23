import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  Length,
} from 'class-validator';
import { USER_MESSAGES } from '../messages/user.message';
import { Match } from '../decorators/match.decorator';

export class CheckEmailDto {
  @ApiProperty({
    description: 'E-mail para verificação de existência',
    example: 'sysadmin@qacoders.com',
  })
  @IsEmail({}, { message: USER_MESSAGES.EMAIL_INVALID_FORMAT })
  @IsNotEmpty({ message: USER_MESSAGES.FIELD_REQUIRED('Email') })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'sysadmin@qacoders.com',
  })
  @IsEmail({}, { message: USER_MESSAGES.EMAIL_INVALID_FORMAT })
  @IsNotEmpty({ message: USER_MESSAGES.FIELD_REQUIRED('Email') })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Resposta da pergunta secreta para validação',
    example: 'Azul Marinho',
  })
  @IsString()
  @IsNotEmpty({ message: USER_MESSAGES.FIELD_REQUIRED('Resposta secreta') })
  secretAnswer: string;

  @ApiProperty({ example: '1234@Test' })
  @IsString({ message: 'O campo Senha deve ser preenchido no formato texto.' })
  @IsNotEmpty({ message: 'O campo Senha é obrigatório.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])\S+$/,
    {
      message:
        'Senha precisa conter: uma letra maiúscula, minúscula, número, e um caractere especial(@#$%).',
    },
  )
  @Length(8, 16, {
    message: 'O campo Senha deve possuir no mínimo 8 e no máximo 16 caráteres.',
  })
  newPassword: string;

  @ApiProperty({ example: '1234@Test' })
  @IsString({
    message: 'O campo Confirmar Senha deve ser preenchido no formato texto.',
  })
  @IsNotEmpty({ message: 'O campo Confirmar Senha é obrigatório.' })
  @Match('newPassword', {
    message: 'A confirmação de senha deve ser igual à senha.',
  })
  confirmNewPassword: string;
}
