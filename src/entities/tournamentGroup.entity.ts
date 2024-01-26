export class TournamentGroup {
  groupId: string; // partition key
  username: string; // sort key
  tournamentId: string;
  tournamentScore: number;

  public static newInstanceFromDynamoDBObject(data: any): TournamentGroup {
    const result = new TournamentGroup();
    result.groupId = data.groupId.S;
    result.username = data.username.S;
    result.tournamentId = data.tournamentId.S;
    result.tournamentScore = data.tournamentScore.N;

    return result;
  }

  public static newInstanceFromDynamoDBObjectWithoutTournamentId(
    data: any,
  ): TournamentGroup {
    const result = new TournamentGroup();
    result.groupId = data.groupId.S;
    result.username = data.username.S;
    result.tournamentScore = data.tournamentScore.N;

    return result;
  }
}
