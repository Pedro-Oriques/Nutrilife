import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Delete,
  Param,
  NotFoundException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AUTH_MESSAGES } from 'src/auth/auth.message';
import { CreateUserDto, LoginUserDto } from '../dtos/user.dto';
import { USER_MESSAGES } from '../messages/user.message';
import { UserService } from '../services/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Register')
@Controller('user')
export class RegisterController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastro de novo usuário',
    description: 'Endpoint para cadastro de novo usuário na plataforma.',
  })
  @ApiResponse({ status: 201, description: USER_MESSAGES.REGISTRATION_SUCCESS })
  @ApiResponse({ status: 400, description: AUTH_MESSAGES.BAD_REQUEST })
  @ApiResponse({
    status: 409,
    description: USER_MESSAGES.USER_ALREADY_REGISTERED,
  })
  async registerUser(@Body() UserDto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(UserDto);
      return { message: 'Cadastro realizado com sucesso.', data: user };
    } catch (error) {
      if (error.status === 409 || error instanceof ConflictException) {
        throw new ConflictException('Este e-mail já foi cadastrado');
      }
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir usuário',
    description: 'Endpoint para excluir um usuário pelo ID.',
  })
  @ApiResponse({ status: 204, description: 'Usuário excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async deleteUser(@Param('id') id: string) {
    const deleted = await this.userService.deleteUser(id);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return;
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Endpoint para listar todos os usuários.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  async getAllUsers() {
    return this.userService.findAll();
  }
}
