import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/auth-user.interface';
import { User } from '../users/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>, private readonly jwtService: JwtService) {}
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findOneBy({ email })) throw new ConflictException('Este e-mail já está cadastrado.');
    const user = this.users.create({ name: dto.name.trim(), email, passwordHash: await bcrypt.hash(dto.password, 12), role: dto.role ?? 'comprador' });
    return this.createSession(await this.users.save(user));
  }
  async login(dto: LoginDto) {
    const user = await this.users.findOneBy({ email: dto.email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('E-mail ou senha incorretos.');
    return this.createSession(user);
  }
  private async createSession(user: User) {
    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken, tokenType: 'Bearer', user: this.publicProfile(user) };
  }
  private publicProfile(user: User) { return { id:user.id,name:user.name,email:user.email,role:user.role,telephone:user.telephone,state:user.state,city:user.city,neighborhood:user.neighborhood,gender:user.gender,createdAt:user.createdAt }; }
  async getProfile(id: number) { const user = await this.users.findOneBy({ id }); if (!user) throw new NotFoundException('Usuário não encontrado.'); return this.publicProfile(user); }
  async updateProfile(id: number, dto: UpdateProfileDto) { const user = await this.users.findOneBy({ id }); if (!user) throw new NotFoundException('Usuário não encontrado.'); Object.assign(user, dto); return this.publicProfile(await this.users.save(user)); }
  async changePassword(id: number, dto: ChangePasswordDto) { const user = await this.users.findOneBy({ id }); if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) throw new UnauthorizedException('A senha atual está incorreta.'); user.passwordHash = await bcrypt.hash(dto.newPassword, 12); await this.users.save(user); return { updated:true }; }
  async deleteAccount(id: number, password: string) { const user = await this.users.findOneBy({ id }); if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Senha incorreta.'); await this.users.remove(user); return { deleted:true }; }
}
