import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Tournament } from '../entities';
import { TournamentRepository } from '../repositories';

@Injectable()
export class TournamentService {
  constructor(private readonly tournamentRepository: TournamentRepository) {}

  @Cron('0 0 0 * * *', { name: 'start-new-tournament', timeZone: 'UTC' })
  public async startNewTournament() {
    await this.tournamentRepository.endActiveTournament(); // There will be a very short amount of time where there is no active tournament in the system.
    await this.tournamentRepository.upsertOne(Tournament.newInstance());
  }
}
