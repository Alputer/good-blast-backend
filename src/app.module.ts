import { Module } from '@nestjs/common';
import { HealthController } from './controllers';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
