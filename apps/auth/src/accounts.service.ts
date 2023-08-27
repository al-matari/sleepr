import { Injectable, Logger, UnauthorizedException, ValidationError } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import {
  LoginRequest,
  CreateRequest,
  User,
  LoginResponse,
  CreateResponse,
  LoginServiceTypes,
} from './interfaces/login-types';
import { RpcException } from '@nestjs/microservices';
import { NotFoundError } from 'rxjs';
import { UsersRepository } from './users/users.repository';

@Injectable()
export class AccountsService {
  logger = new Logger(this.constructor.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * @description EventBus command to create a new user
   * @return {Promise<UserEntity>} Result from the find
   * @access public
   * @memberOf AccountsService
   * @param input
   */
  private async loginCmd(cmd: LoginRequest): Promise<LoginResponse> {
    try {
      const condition = getLoginQuery(cmd);

      const user = await this.usersRepository.findOne(condition);
      if (!user) {
        throw new NotFoundError('Your login credentials is incorrect');
      }

      if (cmd.service === LoginServiceTypes.Password) {
        const passwordIsValid = await bcrypt.compare(
          cmd.params.password,
          user.password,
        );
        if (!passwordIsValid) {
          throw new UnauthorizedException('Credentials are not valid.');
        }

        // Check if user is verified
        const userEmail = user.emails.reduce(
          (previousValue) => previousValue.primary === true && previousValue,
        );
        if (!userEmail.verified) {
          throw new UnauthorizedException('Please verify your email address');
        }
      }

      this.eventBus.publish(new UserLoggedInEvent(user));

      return {
        user: user as Account.User,
        session: undefined,
      };
    } catch (error) {
      this.logger.log(error);
      throw new RpcException(error.message);
    }

    try {
      const response = await this.accountRpcClient.svc
        .login(input, null)
        .toPromise();
      this.logger.log(response);
      return response;
    } catch (e) {
      this.logger.log(e);
      throw new Error(e.message);
    }
  }

  /**
   * @description EventBus command to create a new user
   * @return {Promise<UserEntity>} Result from the find
   * @access public
   * @memberOf AccountsService
   * @param input
   */
  private async createUser(input: CreateRequest): Promise<CreateResponse> {
    try {
      const response = await this.accountRpcClient.svc
        .create(input, null)
        .toPromise();
      this.logger.log(response);
      return response;
    } catch (e) {
      this.logger.log(e);
      throw new Error(e.message);
    }
  }

  /**
   * @description Validate a user by email and password
   * @return {Promise<UserEntity>} Result from the validation
   * @access public
   * @memberOf AccountsService
   * @param input
   */
  public async validateUser(input: LoginRequest): Promise<User> {
    try {
      const result = await this.loginCmd(input);
      return result.user;
    } catch (e) {
      this.logger.log(e);
      throw new Error(e.message);
    }
  }

  /**
   * @description Validate a user by email and password
   * @return {Promise<UserEntity>} Result from the validation
   * @access public
   * @memberOf AccountsService
   * @param logCmd
   * @param regCmd
   */
  public async validateOrCreateUser(
    logCmd: LoginRequest,
    regCmd: CreateRequest,
  ): Promise<User> {
    let user = null;
    await this.loginCmd(logCmd)
      .then((value) => {
        if (value) {
          user = value.user;
        }
      })
      .catch((reason) => {
        this.logger.error(reason);
      });

    if (user) {
      return user;
    }

    try {
      await this.createUser(regCmd);
      const result = await this.loginCmd(logCmd);
      return result.user;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

function getLoginQuery(cmd: LoginRequest) {
  if (cmd.service === LoginServiceTypes.Password) {
    return {
      emails: { $elemMatch: { address: cmd.params.email, primary: true } },
    };
  } else if (cmd.service === LoginServiceTypes.Google) {
    return {
      emails: { $elemMatch: { address: cmd.params.email, primary: true } },
      'services.google.userId': cmd.params.accessToken,
    };
  } else if (cmd.service === LoginServiceTypes.Github) {
    return {
      $and: [
        {
          emails: { $elemMatch: { address: cmd.params.email, primary: true } },
        },
        { 'services.github.userId': cmd.params.userId },
      ],
    };
  } else if (cmd.service === LoginServiceTypes.Facebook) {
    return {
      emails: { $elemMatch: { address: cmd.params.email, primary: true } },
      'services.facebook.userId': cmd.params.userId,
    };
  } else {
    return {
      emails: { $elemMatch: { address: cmd.params.email, primary: true } },
    };
  }
}
