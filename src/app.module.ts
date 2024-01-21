import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { HealthController } from './controllers';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production' ? '../prod.env' : '../dev.env',
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
