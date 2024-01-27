import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
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
    description: 'Global leaderboard is returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Get('/global')
  public async getGlobalLeaderboard(): Promise<any> {
    return await this.leaderboardService.getGlobalLeaderboard();
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Country leaderboard is returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Get('/country/:countryCode')
  public async getCountryLeaderboard(
    @Param('countryCode') countryCode: string,
  ): Promise<any> {
    return await this.leaderboardService.getCountryLeaderboard(countryCode);
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: "Leaderboard of user's group is returned successfully.",
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Get('/tournament')
  public async getTournamentLeaderboard(
    @Req() req: IAuthorizedRequest,
  ): Promise<any> {
    const user = req.user;
    return await this.leaderboardService.getTournamentLeaderboard(
      user.username,
    );
  }

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
  public async getMyTournamentRank(
    @Req() req: IAuthorizedRequest,
  ): Promise<number> {
    const user = req.user;
    return await this.leaderboardService.getRankOfUserByUsername(user.username);
  }
}
