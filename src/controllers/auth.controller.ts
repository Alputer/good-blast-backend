import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services';
import {
  RegisterDto,
  LoginDto,
  RegisterResponseDto,
  LoginResponseDto,
} from '../dtos/auth';

@ApiBearerAuth()
@Controller('/api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiResponse({
    status: 201,
    description: 'User is created successfully.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Request body does not match required input structure.',
  })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  public async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post('/login')
  @ApiResponse({
    status: 201,
    description: 'Login successful.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Wrong credentials or request body does not match required input structure.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }
}
