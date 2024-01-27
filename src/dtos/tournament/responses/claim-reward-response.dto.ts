import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ClaimRewardResponseDto {
  @ApiProperty()
  @Expose()
  message: string;
}
