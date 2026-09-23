import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FavoriteMealService } from '../services/favorite-meal.service';
import {
  CreateFavoriteMealDto,
  ApplyFavoriteMealDto,
} from '../dtos/favorite-meal.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Ajuste o caminho se necessário

@ApiTags('Favorite Meals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorite-meals')
export class FavoriteMealController {
  constructor(private readonly favoriteMealService: FavoriteMealService) {}

  @Post()
  async createFavorite(@Request() req, @Body() dto: CreateFavoriteMealDto) {
    return this.favoriteMealService.create(req.user.userId, dto);
  }

  @Get()
  async getFavorites(
    @Request() req,
    @Query('mealSession') mealSession?: string,
  ) {
    return this.favoriteMealService.findByUserAndSession(
      req.user.userId,
      mealSession,
    );
  }

  @Delete(':id')
  async deleteFavorite(@Request() req, @Param('id') id: string) {
    return this.favoriteMealService.delete(req.user.userId, id);
  }

  @Post(':id/apply')
  async applyFavorite(
    @Request() req,
    @Param('id') id: string,
    @Body() applyDto: ApplyFavoriteMealDto,
  ) {
    await this.favoriteMealService.applyFavoriteMeal(
      req.user.userId,
      id,
      applyDto,
    );
    return { message: 'Refeição adicionada com sucesso ao diário!' };
  }
}
