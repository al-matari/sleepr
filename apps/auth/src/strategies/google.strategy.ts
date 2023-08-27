import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  Logger,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Strategy } from 'passport-google-oauth';

import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import {
  LoginRequest,
  LoginServiceTypes,
  CreateRequest,
} from '../interfaces/login-types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(OAuth2Strategy) {
  logger = new Logger(this.constructor.name);

  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow('google_clientID'),
      clientSecret: configService.getOrThrow('google_clientSecret'),
      callbackURL: configService.getOrThrow('google_callbackURL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken, refreshToken, profile, done): Promise<any> {
    if (profile && profile.emails.length > 0) {
      const logCmd: LoginRequest = {
        service: LoginServiceTypes.Google,
        params: {
          accessToken,
          userId: profile.id,
          email: profile.emails[0].value,
          password: undefined,
        },
      };

      const regCmd: CreateRequest = {
        service: LoginServiceTypes.Google,
        tokens: {
          accessToken,
          userId: profile.id,
        },
        email: profile.emails[0].value,
        firstname: profile?.name?.givenName,
        lastname: profile?.name?.familyName,
        password: undefined,
        username: profile.username,
      };

      const user = await this.usersService.validateOrCreateUser(logCmd, regCmd);

      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    }
    throw new NotImplementedException();
  }
}
