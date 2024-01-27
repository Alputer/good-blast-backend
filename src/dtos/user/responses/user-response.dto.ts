import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Country } from '../../../enums';
import { IsEnum } from 'class-validator';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  username: string;
  @ApiProperty({ enum: Country })
  @Expose()
  @IsEnum(Country)
  @Type(() => String)
  countryCode: Country;
  @ApiProperty()
  @Expose()
  coins: number;
  @ApiProperty()
  @Expose()
  level: number;
  @ApiProperty()
  @Expose()
  currGroupId: string;
  @ApiProperty()
  @Expose()
  claimedReward: boolean;
  @ApiProperty()
  @Expose()
  joinedTournamentAt: string;
}
