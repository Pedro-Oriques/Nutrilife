import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WaterService } from './services/water.service';
import { AddWaterDto } from './dtos/add-water.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Ajuste o caminho do seu guard
import { Water } from './schemas/water.schema';

@ApiTags('Water')
@Controller('water')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Post()
  @ApiOperation({
    summary: 'Adicionar consumo de água no dia (Soma ao total existente)',
  })
  @ApiResponse({ status: 201, type: Water })
  async addWater(@Req() req: any, @Body() dto: AddWaterDto): Promise<Water> {
    return this.waterService.addWater(req.user.userId, dto);
  }

  @Get(':date')
  @ApiOperation({
    summary: 'Buscar o total de água consumida por data (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, type: Water })
  async getWaterByDate(
    @Req() req: any,
    @Param('date') date: string,
  ): Promise<Water | null> {
    return this.waterService.getWaterByDate(req.user.userId, date);
  }
}
