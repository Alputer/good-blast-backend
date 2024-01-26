import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TournamentService } from '../services';
import { AuthGuard } from '../services/guards';
import { IAuthorizedRequest } from '../interfaces';
import { TournamentGroup } from '../entities';

@ApiBearerAuth()
@Controller('/api/tournament')
@ApiTags('tournament')
export class TorunamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User is fetched successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not satisfy the conditions to join the tournament.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Get('/enter')
  public async enterTournament(
    @Req() req: IAuthorizedRequest,
  ): Promise<TournamentGroup> {
    const user = req.user;
    return await this.tournamentService.enterTournament(user.username);
  }
}
