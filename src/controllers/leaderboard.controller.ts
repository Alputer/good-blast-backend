import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../services/guards';
import { IAuthorizedRequest } from '../interfaces';
import { LeaderboardService } from '../services';

@ApiBearerAuth()
@Controller('/api/leaderboard')
@ApiTags('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User rank is returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Get('/tournament/my-rank')
  public async enterTournament(
    @Req() req: IAuthorizedRequest,
  ): Promise<number> {
    const user = req.user;
    return await this.leaderboardService.getMyRank(user.username);
  }
}
