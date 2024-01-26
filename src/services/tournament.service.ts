import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Tournament, TournamentGroup } from '../entities';
import {
  TournamentRepository,
  TournamentGroupRepository,
} from '../repositories';
import { UserService } from '.';

@Injectable()
export class TournamentService {
  constructor(
    private readonly userService: UserService,
    private readonly tournamentRepository: TournamentRepository,
    private readonly tournamentGroupRepository: TournamentGroupRepository,
  ) {}

  @Cron('0 0 0 * * *', { name: 'start-new-tournament', timeZone: 'UTC' })
  public async startNewTournament() {
    await this.tournamentRepository.endActiveTournament(); // There will be a very short amount of time where there is no active tournament in the system.
    await this.tournamentRepository.upsertOne(Tournament.newInstance());
  }

  public async enterTournament(username: string): Promise<TournamentGroup> {
    const user = await this.userService.findUserByUsername(username);

    const currentUTCHour = new Date().getUTCHours();
    if (currentUTCHour >= 12) {
      throw new BadRequestException(
        'You cannot enter the tournament after 12:00 UTC',
      );
    }

    if (user.level < 10) {
      throw new BadRequestException(
        'You should complete at least 10 level to participate in a tournament',
      );
    }

    if (user.coins < 500) {
      throw new BadRequestException(
        'You should have at least 500 coins to participate in a tournament',
      );
    }

    if (!user.claimedReward) {
      throw new BadRequestException(
        'You are already in a tournament or did not claim your reward from previous tournament',
      );
    }

    let availableGroupInfo;

    let tryCount = 3;
    while (true) {
      if (tryCount <= 0)
        throw new InternalServerErrorException(
          'Enter tournament db transaction failed 3 times in a row.',
        );
      try {
        availableGroupInfo =
          await this.tournamentGroupRepository.findAvailableGroup(); // find group and return it.
        await this.tournamentGroupRepository.upsertOne(
          {
            groupId: availableGroupInfo.Items[0].availableGroupId.S,
            username: user.username,
            tournamentId: availableGroupInfo.Items[0].id.S,
            tournamentScore: 0,
          },
          availableGroupInfo.Items[0].availableGroupItemCount.N,
        ); // insert user into that group.
        break;
      } catch (error) {
        console.log(error);
        tryCount--;
        continue; // it means transaction failed, so we retry
      }
    }

    return {
      groupId: availableGroupInfo.Items[0].availableGroupId.S,
      username: user.username,
      tournamentId: availableGroupInfo.Items[0].id.S,
      tournamentScore: 0,
    };
  }

  public async claimReward(username: string) {
    const user = await this.userService.findUserByUsername(username);
    const groupId = user.currGroupId;
    if (groupId === '') {
      throw new BadRequestException(
        'You did not participate in any tournament',
      );
    }

    if (user.claimedReward) {
      throw new BadRequestException('You already claimed your reward');
    }

    const tournamentGroup =
      await this.tournamentGroupRepository.findTournamentGroupByGroupId(
        groupId,
      );

    const tournament = await this.tournamentRepository.findTournamentById(tournamentGroup.tournamentId);
    if(tournament.isOngoing){
        throw new BadRequestException('You cannot claim reward before the tournament ends');
    }
    //find rank and update
  }
}
