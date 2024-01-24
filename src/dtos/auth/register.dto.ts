import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Country } from '../../enums';

export class RegisterDto {
  @ApiProperty({
    uniqueItems: true,
    minLength: 6,
    example: 'fluffyPanda38',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    minLength: 6,
    example: 'pass123',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: Country, type: 'enum', example: 'US' })
  @IsEnum(Country)
  @IsNotEmpty()
  countryCode: Country;
}
