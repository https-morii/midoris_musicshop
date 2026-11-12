import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../common/authenticated-request.interface';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) { return this.authService.register(dto); }
  @Post('login') login(@Body() dto: LoginDto) { return this.authService.login(dto); }
  @UseGuards(JwtAuthGuard) @Get('me') me(@Req() req: AuthenticatedRequest) { return this.authService.getProfile(req.user.id); }
  @UseGuards(JwtAuthGuard) @Patch('me') updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) { return this.authService.updateProfile(req.user.id, dto); }
  @UseGuards(JwtAuthGuard) @Patch('me/password') changePassword(@Req() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) { return this.authService.changePassword(req.user.id, dto); }
  @UseGuards(JwtAuthGuard) @Delete('me') deleteAccount(@Req() req: AuthenticatedRequest, @Body() dto: DeleteAccountDto) { return this.authService.deleteAccount(req.user.id, dto.password); }
}
