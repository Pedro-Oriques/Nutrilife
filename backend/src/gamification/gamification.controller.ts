import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetRankingDto } from './dtos/get-ranking.dto';
import { GetPointsDto } from './dtos/get-points.dto';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo de gamificação dos últimos 30 dias' })
  async getSummary(@Req() req: any) {
    return this.gamificationService.getSummary(req.user.userId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Pontos por dia dos últimos 30 dias' })
  async getCalendar(@Req() req: any) {
    return this.gamificationService.getCalendar(req.user.userId);
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Ranking de usuários por pontuação' })
  @ApiQuery({ name: 'period', enum: ['weekly', 'monthly', 'all-time'], required: true })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getRanking(@Query() query: GetRankingDto) {
    return this.gamificationService.getRanking(
      query.period,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get('points')
  @ApiOperation({ summary: 'Histórico paginado de pontos do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getPoints(@Req() req: any, @Query() query: GetPointsDto) {
    return this.gamificationService.getPoints(
      req.user.userId,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get('scoring-rules')
  @ApiOperation({ summary: 'Regras de pontuação por ação' })
  getScoringRules() {
    return this.gamificationService.getScoringRules();
  }
}
