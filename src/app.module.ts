import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  AuthController,
  HealthController,
  UserController,
} from './controllers';
import { AuthService, UserService, TournamentService } from './services';
import { TournamentRepository, UserRepository } from './repositories';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production' ? '../prod.env' : '../dev.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController, AuthController, UserController],
  providers: [AuthService, UserService, TournamentService, UserRepository, TournamentRepository],
})
export class AppModule {}
