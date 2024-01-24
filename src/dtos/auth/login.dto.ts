import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
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
}
