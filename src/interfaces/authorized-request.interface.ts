import { Request } from 'express';
import { IUser } from '.';

export interface IAuthorizedRequest extends Request {
  user: IUser;
}
