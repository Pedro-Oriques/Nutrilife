import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecoveryService } from '../services/recovery.service';
import { CheckEmailDto, ChangePasswordDto } from '../dtos/recovery.dto';

@ApiTags('Recovery')
@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('checkEmail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar e-mail para recuperação',
    description:
      'Verifica se o e-mail existe e retorna a pergunta secreta associada.',
  })
  @ApiResponse({
    status: 200,
    description: 'E-mail encontrado, pergunta retornada.',
  })
  @ApiResponse({ status: 404, description: 'Mensagem e-mail inexistente' })
  async checkEmailForRecovery(@Body() dto: CheckEmailDto) {
    return this.recoveryService.findQuestionByEmail(dto.email);
  }

  @Post('resetPassword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redefinir senha',
    description:
      'Valida a resposta secreta e atualiza a senha do usuário em uma única etapa.',
  })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Senhas não coincidem.' })
  @ApiResponse({ status: 401, description: 'Resposta secreta incorreta.' })
  @ApiResponse({ status: 404, description: 'E-mail não encontrado.' })
  async resetPassword(@Body() dto: ChangePasswordDto) {
    return this.recoveryService.updatePassword(dto);
  }
}
