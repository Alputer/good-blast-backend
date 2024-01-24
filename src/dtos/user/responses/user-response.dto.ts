import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Country } from '../../../enums';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  username: string;
  @ApiProperty({ enum: Country })
  @Expose()
  countryCode: Country;
  @ApiProperty()
  @Expose()
  coins: number;
  @ApiProperty()
  @Expose()
  level: number;
  @ApiProperty()
  @Expose()
  currGroupId: number;
  @ApiProperty()
  @Expose()
  claimedReward: boolean;
  @ApiProperty()
  @Expose()
  createdAt: Date;
  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
