import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { compare, hash } from 'bcrypt';
import { User, UserDocument } from '../schemas/user.squema';
import { ChangePasswordDto } from '../dtos/recovery.dto';

@Injectable()
export class RecoveryService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findQuestionByEmail(
    email: string,
  ): Promise<{ secretQuestion: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException({
        message: 'E-mail inexistente no sistema.',
      });
    }

    return { secretQuestion: user.secretQuestion };
  }

  async updatePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    // 1. Validar se as senhas novas coincidem
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException({ message: 'As senhas não coincidem.' });
    }

    // 2. Buscar usuário
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new NotFoundException({
        message: 'E-mail inexistente no sistema.',
      });
    }


    // 3. Validar a resposta secreta

const normalizedAnswer = dto.secretAnswer
  .trim()          // remove espaços extras
  .toLowerCase();  // transforma tudo em minúsculo

const isMatch = await compare(normalizedAnswer, user.secretAnswer);

if (!isMatch) {
  throw new UnauthorizedException({
    message: 'Resposta incorreta, verifique e tente novamente.',
  });
}


    /* antigamente era assim
    // 3. Validar a resposta secreta
    const isMatch = await compare(dto.secretAnswer, user.secretAnswer);
    if (!isMatch) {
      throw new UnauthorizedException({
        message: 'Resposta incorreta, verifique e tente novamente.',
      });
    }
    */

    // 4. Gerar hash da nova senha e salvar
    const hashedPassword = await hash(dto.newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Senha alterada com sucesso.' };
  }
}
