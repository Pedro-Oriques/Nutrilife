import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  NotContains,
  ValidateIf,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';

const SECRET_QUESTIONS = [
  'Qual sua cor favorita ?',
  'Qual o nome do seu primeiro animal de estimação ?',
  'Qual a primeira escola em que você estudou ?',
  'Qual sua comida favorita ?',
];

export class LoginUserDto {
  @ApiProperty({ example: 'sysadmin@qacoders.com' })
  @IsString({ message: 'O campo Email deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo Email é obrigatório.' })
  email: string;

  @ApiProperty({ example: '1234@Test' })
  @IsString({ message: 'O campo Senha deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo Senha é obrigatório.' })
  password: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Perfil do usuário',
    example: 'user',
    enum: ['user', 'admin'],
    default: 'user',
    required: false,
  })
  @IsString()
  @IsIn(['user', 'admin'], { message: 'O perfil deve ser user ou admin.' })
  role?: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Carlos Silva',
  })
  @IsNotEmpty({ message: 'O campo Nome completo é obrigatório.' })
  @IsString({
    message: 'O campo Nome completo deve ser preenchido no formato texto.',
  })
  @Length(2, 100, {
    message:
      'O campo Nome completo deve possuir no mínimo 2 e no máximo 100 caráteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ]+(\s[a-zA-ZÀ-ÿ]+)+$/, {
    message:
      'O campo Nome completo aceita apenas letras e deve conter no mínimo duas palavras.',
  })
  fullName: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'sysadmin@qacoders.com',
  })
  @IsNotEmpty({ message: 'O campo E-mail é obrigatório.' })
  @IsString({ message: 'O campo E-mail deve ser preenchido no formato texto.' })
  @NotContains(' ', { message: 'O campo E-mail não pode conter espaços.' })
  @IsEmail(
    {},
    {
      message:
        'O campo E-mail deve ser preenchido no formato nome@dominio.com.',
    },
  )
  @Length(1, 100, {
    message: 'O campo E-mail deve possuir no máximo 100 caráteres.',
  })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Pergunta secreta',
    example: 'Qual sua cor favorita ?',
  })
  @ValidateIf((o) => !o.role || o.role === 'user')
  @IsNotEmpty({ message: 'O campo Pergunta secreta é obrigatório.' })
  @IsIn(SECRET_QUESTIONS, {
    message: 'A pergunta secreta deve ser uma das opções válidas.',
  })
  secretQuestion?: string;

  @ApiProperty({
    description: 'Resposta da pergunta secreta',
    example: 'Azul',
  })
  @ValidateIf((o) => !o.role || o.role === 'user')
  @IsNotEmpty({ message: 'O campo Resposta secreta é obrigatório.' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'O campo Resposta secreta aceita apenas letras e espaços.',
  })
  secretAnswer?: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '1234@Test',
  })
  @IsNotEmpty({ message: 'O campo Senha é obrigatório.' })
  @IsString({ message: 'O campo Senha deve ser preenchido no formato texto.' })
  @Length(8, 16, {
    message: 'O campo Senha deve possuir no mínimo 8 e no máximo 16 caráteres.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])\S+$/,
    {
      message:
        'Senha precisa conter: uma letra maiúscula, minúscula, número, e um caractere especial(@#$%).',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Confirmação da senha',
    example: '1234@Test',
  })
  @IsNotEmpty({ message: 'O campo Confirmar Senha é obrigatório.' })
  @Match('password', {
    message: 'A confirmação de senha deve ser igual à senha.',
  })
  confirmPassword: string;
}
