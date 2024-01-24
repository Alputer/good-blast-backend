import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {

  @Cron('0 0 0 * * *')
  handleCron() {
  }
}