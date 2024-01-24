import { IsOngoing } from 'src/enums';
import { v4 as uuidv4 } from 'uuid';

export class Tournament {
  id: string;
  startTime: string;
  duration: number; // in seconds
  isOngoing: IsOngoing; // it is string to supply it as GSI.

  public static newInstance() {
    const result = new Tournament();
    result.id = uuidv4();
    result.startTime = result.getCurrentTimeUTC();
    result.duration = 60 * 60 * 24;
    result.isOngoing = IsOngoing.TRUE;

    return result;
  }

  public static newInstanceFromDynamoDBObject(data: any): Tournament {
    const result = new Tournament();
    result.id = data.id.S;
    result.startTime = data.startTime.S;
    result.duration = data.duration.N;
    result.isOngoing = data.isOngoing.S;

    return result;
  }

  private getCurrentTimeUTC(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }
}
