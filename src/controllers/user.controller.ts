import {
  Controller,
  Param,
  Get,
  Post,
  UseGuards,
  Req,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services';
import { User } from '../entities';
import { AuthGuard } from '../services/guards';
import { IAuthorizedRequest, IUser } from '../interfaces';
import { UserResponseDto } from '../dtos/user/responses';
import { SerializerInterceptor } from '../interceptors';

@ApiBearerAuth()
@Controller('/api/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(new SerializerInterceptor(UserResponseDto))
  @ApiResponse({
    status: 200,
    description: 'User is fetched successfully.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'You did not specify path parameter.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Get('/:username')
  public async findUserByUsername(
    @Param('username') username: string,
  ): Promise<UserResponseDto> {
    return await this.userService.findUserByUsername(username);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(new SerializerInterceptor(UserResponseDto))
  @ApiResponse({
    status: 200,
    description: 'User is fetched successfully.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'You did not specify path parameter.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Get('/me')
  public async findCurrentUser(
    @Req() req: IAuthorizedRequest,
  ): Promise<UserResponseDto> {
    const username = req.user.username;
    return await this.userService.findUserByUsername(username);
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Complete level request is successfully processed.',
  })
  @ApiResponse({
    status: 401,
    description: 'You are not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, contact with backend team.',
  })
  @Post('/complete-level')
  public async claimReward(@Req() req: IAuthorizedRequest): Promise<void> {
    const user = req.user;
    return await this.userService.completeLevel(user.username);
  }
}
