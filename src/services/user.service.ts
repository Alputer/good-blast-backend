import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from '../dtos/auth';
import { UserRepository } from '../repositories';
import { User } from '../entities';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(registerDto: RegisterDto): Promise<User> {
    const newUser = await User.newInstanceFromDTO(registerDto);
    return this.userRepository.upsertOne(newUser);
  }

  public async findUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findUserByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  public async userWithUsernameExists(username: string): Promise<boolean> {
    return this.userRepository.userWithUsernameExists(username);
  }

  public async completeLevel(username: string): Promise<void> {
    const user = await this.userRepository.findUserByUsername(username);

    if (user.isInTournament) {
      await this.userRepository.completeLevelWithScoreUpdate;
    } else {
      await this.userRepository.completeLevel(user);
    }
  }
}
