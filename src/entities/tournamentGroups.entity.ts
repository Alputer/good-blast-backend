import { RegisterDto } from '../dtos/auth';
import { v4 as uuidv4 } from 'uuid';

export class TournamentGroup {
  groupId: string; // partition key
  username: string; // sort key
  tournamentId: string;
  tournamentScore: number;

  static newInstanceFromDynamoDBObject(data: any): TournamentGroup {
    const result = new TournamentGroup();
    result.groupId = data.groupId.S;
    result.username = data.username.S;
    result.tournamentId = data.tournamentId.S;
    result.tournamentScore = data.tournamentScore.N;

    return result;
  }
}
