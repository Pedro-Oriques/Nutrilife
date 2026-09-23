import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/services/user.service';
import { GamificationService } from '../gamification/gamification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Alterado apenas o payload para incluir 'sub' e 'email', mantendo o resto igual
    const payload = {
      sub: user._id,
      email: user.email,
      username: user.fullName,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    try {
      await this.gamificationService.awardPoints(user._id.toString(), 'login');
    } catch (err) {
      console.error('Failed to award login points:', err);
    }

    return {
      msg: 'Autenticado com sucesso',
      payload: {
        username: user.fullName,
        id: user._id,
      },
      token,
    };
  }
}
