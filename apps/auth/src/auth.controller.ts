import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { CurrentUser, UserDocument } from '@app/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.authService.login(user, response);
    response.send(jwt);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user;
  }
  /*
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  async register(@Body() userDto: any) {
    return this.commandBus.execute(new RegisterUserCommand(userDto));
  }

  @Post('verify-email')
  async verifyEmail(@Body('email') email: string) {
    return this.commandBus.execute(new VerifyEmailCommand(email));
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.commandBus.execute(new LoginUserCommand(email, password));
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('email') email: string) {
    return this.commandBus.execute(new ResendVerificationEmailCommand(email));
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.commandBus.execute(new ForgotPasswordCommand(email));
  }

  @Put('update-password')
  async updatePassword(@Body('userId') userId: string, @Body('password') password: string) {
    return this.commandBus.execute(new UpdateUserPasswordCommand(userId, password));
  }

  @Put('update-user')
  async updateUser(@Body('userId') userId: string, @Body() userData: any) {
    return this.commandBus.execute(new UpdateUserCommand(userId, userData));
  }

  @Get(':id')
  async getUser(@Param('id') userId: string) {
    return this.queryBus.execute(new GetUserQuery(userId));
  }
  */
}
