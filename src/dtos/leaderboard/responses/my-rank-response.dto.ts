import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MyRankResponseDto {
  @ApiProperty()
  @Expose()
  rank: number;
}
