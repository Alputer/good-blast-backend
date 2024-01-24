import { Controller, Param, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services';
import { User } from '../entities';
import { AuthGuard } from '../services/guards';
import { IAuthorizedRequest } from '../interfaces';

@ApiBearerAuth()
@Controller('/api/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
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
  @Get(':username')
  public async findUserByUsername(
    @Param('username') username: string,
  ): Promise<User> {
    return await this.userService.findUserByUsername(username);
  }

  @UseGuards(AuthGuard)
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
  @Get('me')
  public async findCurrentUser(@Req() req: IAuthorizedRequest): Promise<User> {
    const username = req.user.username;
    return await this.userService.findUserByUsername(username);
  }
}
