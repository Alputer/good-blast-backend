import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GlobalLeaderboardResponseDto {
  @ApiProperty()
  @Expose()
  username: string;
  @ApiProperty()
  @Expose()
  levelNum: string;
}
