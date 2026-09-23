import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReportService } from '../services/report.service';
import { GetReportDto } from '../dtos/get-report.dto';

@ApiTags('Report')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOperation({
    summary: 'Gera o relatório alimentar',
    description:
      'Retorna totalizadores, dados do gráfico evolutivo e tabela de refeições paginada baseada no período informado.',
  })
  async getReport(@Request() req, @Query() query: GetReportDto) {
    const userId = req.user.userId;
    return this.reportService.generateReport(userId, query);
  }
}
