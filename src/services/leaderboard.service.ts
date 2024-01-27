import { BadRequestException, Injectable } from '@nestjs/common';
import { TournamentGroupRepository, UserRepository } from '../repositories';
import { SortOption } from '../enums';
import { IUser } from '../interfaces';
import { GlobalLeaderboardResponseDto, TournamentLeaderboardResponseDto } from '../dtos/leaderboard/responses';

@Injectable()
export class LeaderboardService {
  constructor(
    public readonly tournamentGroupRepository: TournamentGroupRepository,
    public readonly userRepository: UserRepository,
  ) {}

  public async getGlobalLeaderboard(): Promise<GlobalLeaderboardResponseDto[]>{
    const users = await this.userRepository.getGlobalLeaderboard();

    return users;
  }

  public async getCountryLeaderboard(countryCode: string) {
    const users = await this.userRepository.getCountryLeaderboard(countryCode);

    return users;
  }

  public async getTournamentLeaderboard(username: string): Promise<TournamentLeaderboardResponseDto[]> {
    const user = await this.userRepository.findUserByUsername(username);

    if (user.currGroupId === '') {
      throw new BadRequestException(
        'User did not participate in any tournament yet',
      );
    }

    const membersSorted =
      await this.tournamentGroupRepository.getGroupMembersByGroupId(
        user.currGroupId,
        SortOption.DESC,
      );

    return membersSorted;
  }

  public async getRankOfUserByUsername(username: string): Promise<number> {
    const user = await this.userRepository.findUserByUsername(username);

    if (user.currGroupId === '') {
      throw new BadRequestException(
        'User did not participate in any tournament yet',
      );
    }

    return await this.getRankOfUserByUserObject(user);
  }

  public async getRankOfUserByUserObject(user: IUser): Promise<number> {
    const members =
      await this.tournamentGroupRepository.getGroupMembersByGroupId(
        user.currGroupId,
        SortOption.NO_SORT,
      );
    const userScore = members[members.findIndex(
      (item) => item.username === user.username,
    )].tournamentScore;

    let rank = 1; // calculate the rank of user in the group
    for (let member of members) {
      if (member.tournamentScore > userScore) {
        rank++;
      }
    }

    return rank;
  }
}
