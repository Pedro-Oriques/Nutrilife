import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Ajuste o caminho do seu Guard
import { ProfileService } from '../services/profile.services';
import { CreateProfileDto } from '../dtos/profile.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('form')
  @ApiOperation({ summary: 'Criar ou Atualizar perfil de saúde do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil salvo com sucesso.' })
  async createOrUpdate(@Req() req, @Body() dto: CreateProfileDto) {
    return this.profileService.createOrUpdate(req.user.userId, dto);
  }

  @Put('form')
  @ApiOperation({ summary: 'Atualizar perfil de saúde do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  async update(@Req() req, @Body() dto: CreateProfileDto) {
    return this.profileService.createOrUpdate(req.user.userId, dto);
  }

  @Get('formList')
  @ApiOperation({ summary: 'Obter perfil de saúde do usuário logado' })
  async getProfile(@Req() req) {
    return this.profileService.findByUserId(req.user.userId);
  }
}
