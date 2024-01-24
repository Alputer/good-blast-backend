import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { User } from '../../../entities';

export class LoginResponseDto {
  @ApiProperty({
    description: 'User information',
    type: User,
  })
  @IsObject()
  @ValidateNested()
  @Expose()
  @Type(() => User)
  user: User;

  @ApiProperty({
    description:
      'This value should be included in the authorization header of the next requests.',
  })
  @IsNotEmpty()
  accessToken: string;
}
