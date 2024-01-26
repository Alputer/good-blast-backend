export interface IUser {
  username: string;
  countryCode: string;
  coins: number;
  level: number;
  currGroupId: number;
  claimedReward: boolean;
  createdAt: Date;
  updatedAt: Date;
}
