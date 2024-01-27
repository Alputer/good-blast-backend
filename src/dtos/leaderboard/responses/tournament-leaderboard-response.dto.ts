import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TournamentLeaderboardResponseDto {
  @ApiProperty()
  @Expose()
  username: string;
  @ApiProperty()
  @Expose()
  tournamentScore: number;
}
