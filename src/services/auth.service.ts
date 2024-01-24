import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { UserService } from '../services';
import { JwtService } from '@nestjs/jwt';
import {
  RegisterDto,
  LoginDto,
  RegisterResponseDto,
  LoginResponseDto,
} from '../dtos/auth';
import { UserRepository } from '../repositories';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  public async register(
    registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    const userExists = await this.userRepository.userWithUsernameExists(
      registerDto.username,
    );

    if (userExists) {
      throw new ConflictException('User with username already exists');
    }
    const [createdUser, accessToken] = await Promise.all([
      await this.userService.createUser(registerDto),
      await this.jwtService.signAsync({
        username: registerDto.username,
        countryCode: registerDto.countryCode,
      }),
    ]);

    return {
      user: createdUser,
      accessToken: accessToken,
    };
  }

  public async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findUserByUsername(
      loginDto.username,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordCorrect = await user.compareEncryptedPassword(
      loginDto.password,
    );

    if (!passwordCorrect) {
      throw new BadRequestException('Wrong password');
    }

    const accessToken = await this.jwtService.signAsync({
      username: user.username,
      countryCode: user.countryCode,
    });

    return {
      user: user,
      accessToken: accessToken,
    };
  }
}
