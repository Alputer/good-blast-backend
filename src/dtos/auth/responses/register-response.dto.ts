import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { UserResponseDto } from '../../user/responses';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  @IsObject()
  @ValidateNested()
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({
    description:
      'This value should be included in the authorization header of the next requests.',
  })
  @IsNotEmpty()
  @Expose()
  accessToken: string;
}
