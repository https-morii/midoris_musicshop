import { IsEmail, IsIn, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
export class RegisterDto {
  @IsString() @MaxLength(120) name: string;
  @IsEmail() @MaxLength(180) email: string;
  @IsString() @MinLength(8) @MaxLength(100) password: string;
  @IsOptional() @IsIn(['comprador', 'vendedor']) role?: 'comprador' | 'vendedor';
}
