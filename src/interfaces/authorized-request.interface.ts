import { Request } from 'express';

interface IPayload {
  username: string;
  countryCode: string;
  coins: number;
  level: number;
  currGroupId: number;
  claimedReward: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthorizedRequest extends Request {
  user: IPayload;
}
