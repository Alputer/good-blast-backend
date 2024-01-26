import { RegisterDto } from '../dtos/auth';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class User {
  username: string;
  password: string;
  countryCode: string;
  coins: number;
  level: number;
  levelAndUsername: string; // Used for second GSI for ensuring uniqueness
  currGroupId: string;
  claimedReward: boolean;
  joinedTournamentAt: string;

  public static async newInstanceFromDTO(data: RegisterDto) {
    const result = new User();
    result.username = data.username;
    result.password = await result.getEncryptedPassword(data.password);
    result.countryCode = data.countryCode;
    result.coins = 1000;
    result.level = 1;
    result.currGroupId = '';
    result.levelAndUsername = `0000001#${data.username}`;
    result.claimedReward = true;
    result.joinedTournamentAt = '';

    return result;
  }

  public static newInstanceFromDynamoDBObject(data: any): User {
    const result = new User();
    result.username = data.username.S;
    result.password = data.password.S;
    result.countryCode = data.countryCode.S;
    result.coins = data.coins.N;
    result.level = data.level.N;
    result.levelAndUsername = data.levelAndUsername.S;
    result.currGroupId = data.currGroupId.N;
    result.claimedReward = data.claimedReward.BOOL;
    result.joinedTournamentAt = data.joinedTournamentAt.S;

    return result;
  }

  public async getEncryptedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  public async compareEncryptedPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public isInTournament() {
    if (this.joinedTournamentAt === '') return false;

    const joinedTournamentAt = new Date(this.joinedTournamentAt);
    const now = new Date();

    return (
      joinedTournamentAt.getUTCFullYear() === now.getUTCFullYear() &&
      joinedTournamentAt.getUTCMonth() === now.getUTCMonth() &&
      joinedTournamentAt.getUTCDate() === now.getUTCDate()
    );
  }
}
