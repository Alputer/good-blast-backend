import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  AuthController,
  HealthController,
  UserController,
} from './controllers';
import { AuthService, UserService } from './services';
import { UserRepository } from './repositories';

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
  ],
  controllers: [HealthController, AuthController, UserController],
  providers: [AuthService, UserService, UserRepository],
})
export class AppModule {}
