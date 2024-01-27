import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CountryLeaderboardResponseDto {
  @ApiProperty()
  @Expose()
  username: string;
  @ApiProperty()
  @Expose()
  levelNum: string;
}
