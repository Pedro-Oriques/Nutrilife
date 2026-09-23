import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DailyTrackingService } from '../services/daily-tracking.service';
import { AddFoodEntryDto } from '../dtos/add-food-entry.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DAILY_TRACKING_MESSAGES } from '../messages/daily-tracking.message';

@ApiTags('Daily Tracking')
@Controller('daily-tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class DailyTrackingController {
  constructor(private readonly dailyTrackingService: DailyTrackingService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar alimento ao acompanhamento diário' })
  @ApiResponse({
    status: 201,
    description: DAILY_TRACKING_MESSAGES.ENTRY_ADDED,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: DAILY_TRACKING_MESSAGES.FOOD_NOT_FOUND })
  async addEntry(@Req() req: any, @Body() addFoodEntryDto: AddFoodEntryDto) {
    return this.dailyTrackingService.addEntry(req.user.userId, addFoodEntryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obter acompanhamento diário',
    description:
      'Retorna todas as entradas do dia, agrupadas por sessão de refeição, com total de calorias.',
  })
  @ApiResponse({
    status: 200,
    description: DAILY_TRACKING_MESSAGES.TRACKING_RETRIEVED,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getDailyTracking(
    @Req() req: any,
    @Query('date') date?: string,
  ): Promise<any> {
    return this.dailyTrackingService.getDailyTracking(req.user.userId, date);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover entrada do acompanhamento diário' })
  @ApiResponse({ status: 204, description: DAILY_TRACKING_MESSAGES.ENTRY_REMOVED })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: DAILY_TRACKING_MESSAGES.UNAUTHORIZED })
  @ApiResponse({ status: 404, description: DAILY_TRACKING_MESSAGES.ENTRY_NOT_FOUND })
  async removeEntry(@Req() req: any, @Param('id') id: string): Promise<void> {
    return this.dailyTrackingService.removeEntry(req.user.userId, id);
  }
}
