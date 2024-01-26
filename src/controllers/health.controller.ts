import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller('/api')
export class HealthController {
  constructor() {}
  @Get('/healthcheck')
  public async healthCheck(): Promise<HttpStatus> {
    return HttpStatus.OK;
  }
}
