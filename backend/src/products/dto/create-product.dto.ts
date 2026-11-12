import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(2) @MaxLength(160) name: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) price: number;
  @IsString() @MaxLength(100) category: string;
  @IsOptional() @IsString() @MaxLength(4200000) imageUrl?: string;
}
