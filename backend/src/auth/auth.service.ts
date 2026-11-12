import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/auth-user.interface';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOneBy({ email });
    if (existing) {
      throw new UnauthorizedException('Este e-mail já está cadastrado.');
    }

    const user = this.users.create({
      name: dto.name.trim(),
      email,
      passwordHash: await bcrypt.hash(dto.password, 12),
      role: dto.role ?? 'comprador',
    });
    const savedUser = await this.users.save(user);
    return this.createSession(savedUser);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOneBy({ email: dto.email.trim().toLowerCase() });
    const passwordMatches = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }
    return this.createSession(user);
  }

  private async createSession(user: User) {
    const safeUser: AuthUser = { id: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken, tokenType: 'Bearer', user: { ...safeUser, name: user.name } };
  }

  async getProfile(id: number) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Usuário não encontrado.');
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
