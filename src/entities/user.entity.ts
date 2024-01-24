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
  currGroupId: number;
  claimedReward: boolean;
  createdAt: Date;
  updatedAt: Date;

  static async newInstanceFromDTO(data: RegisterDto) {
    const result = new User();
    result.username = data.username;
    result.password = await result.getEncryptedPassword(data.password);
    result.countryCode = data.countryCode;
    result.coins = 1000;
    result.level = 1;
    result.currGroupId = -1;
    result.levelAndUsername = `0000001#${data.username}`;
    result.claimedReward = true;
    const currentTime = new Date();
    result.createdAt = currentTime;
    result.updatedAt = currentTime;

    return result;
  }

  static newInstanceFromDynamoDBObject(data: any): User {
    const result = new User();
    result.username = data.username.S;
    result.password = data.password.S;
    result.countryCode = data.countryCode.S;
    result.coins = data.coins.N;
    result.level = data.level.N;
    result.levelAndUsername = data.levelAndUsername.S;
    result.currGroupId = data.currGroupId.N;
    result.claimedReward = data.claimedReward.BOOL;
    result.createdAt = new Date(Number(data.createdAt.N));
    result.updatedAt = new Date(Number(data.updatedAt.N));

    return result;
  }

  async getEncryptedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compareEncryptedPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
