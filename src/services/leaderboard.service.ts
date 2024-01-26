import { BadRequestException, Injectable } from '@nestjs/common';
import { TournamentGroupRepository, UserRepository } from '../repositories';
import { SortOption } from '../enums';

@Injectable()
export class LeaderboardService {
  constructor(
    public readonly tournamentGroupRepository: TournamentGroupRepository,
    public readonly userRepository: UserRepository,
  ) {}

  public async getMyRank(username: string): Promise<number> {
    const user = await this.userRepository.findUserByUsername(username);

    if (user.currGroupId === '') {
      throw new BadRequestException(
        'User did not participate in any tournament yet',
      );
    }
    const members =
      await this.tournamentGroupRepository.getGroupMembersByGroupId(
        user.currGroupId,
        SortOption.NO_SORT,
      );
    const userScore = members.findIndex(
      (item) => item.username === username,
    ).tournamentScore;

    let rank = 1; // calculate the rank of user in the group
    for (let member of members) {
      if (member.tournamentScore > userScore) {
        rank++;
      }
    }

    return rank;
  }
}
