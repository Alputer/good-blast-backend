import { RegisterDto } from '../dtos/auth';
import { v4 as uuidv4 } from 'uuid';

export class Tournament {
  id: string;
  startTime: string;
  endTime: string;
  isOngoing: boolean;

  static newInstance() {
    const result = new Tournament();
    result.id = uuidv4();
    const { currentTimeUTC, timeAfter24HoursUTC } =
      result.getCurrentAndFutureTimeUTC();
    result.startTime = currentTimeUTC;
    result.endTime = timeAfter24HoursUTC;
    result.isOngoing = true;

    return result;
  }

  static newInstanceFromDynamoDBObject(data: any): Tournament {
    const result = new Tournament();
    result.id = data.id.S;
    result.startTime = data.startTime.S;
    result.endTime = data.endTime.S;
    result.isOngoing = data.isOngoing.BOOL;

    return result;
  }

  getCurrentAndFutureTimeUTC(): {
    currentTimeUTC: string;
    timeAfter24HoursUTC: string;
  } {
    const currentDate = new Date();
    const currentTimeUTC = currentDate.toISOString();
    const timeAfter24Hours = new Date(
      currentDate.getTime() + 24 * 60 * 60 * 1000,
    );
    const timeAfter24HoursUTC = timeAfter24Hours.toISOString();

    return { currentTimeUTC, timeAfter24HoursUTC };
  }
}
