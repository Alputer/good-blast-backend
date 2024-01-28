import { Controller, UseGuards, Req, Post, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TournamentService } from '../services';
import { AuthGuard } from '../services/guards';
import { IAuthorizedRequest } from '../interfaces';
import { TournamentGroup } from '../entities';
import { ClaimRewardResponseDto } from '../dtos/tournament/responses';

@ApiBearerAuth()
@Controller('/api/tournament')
@ApiTags('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'User joined the tournament successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not satisfy the conditions to join the tournament.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Post('/enter')
  public async enterTournament(
    @Req() req: IAuthorizedRequest,
  ): Promise<TournamentGroup> {
    const user = req.user;
    return await this.tournamentService.enterTournament(user.username);
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'User claimed his/her reward successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'User already claimed his/her reward or tournament has not finished.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Post('/claim-reward')
  public async claimReward(
    @Req() req: IAuthorizedRequest,
  ): Promise<ClaimRewardResponseDto> {
    const user = req.user;
    await this.tournamentService.claimReward(user.username);
    return { message: 'Your reward claim is successfully processed.' };
  }
}
