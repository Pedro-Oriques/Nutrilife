import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from '../user/services/user.service';
import { CreateUserDto } from '../user/dtos/user.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Obter usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso.' })
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Atualizar qualquer usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso.' })
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return;
  }
}

// Teste