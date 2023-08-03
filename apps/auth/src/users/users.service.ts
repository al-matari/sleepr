import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UsersRepository } from './users.repository';
import {
  LoginRequest,
  CreateRequest,
  LoginServiceTypes,
} from '../interfaces/login-types';
import { log } from 'console';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    await this.validateCreateUserDto(createUserDto);
    return this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    });
  }

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({ email: createUserDto.email });
    } catch (err) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists.');
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne(getUserDto);
  }
  private async loginCmd(
    input: Account.LoginRequest,
  ): Promise<Account.LoginResponse> {
    // @ts-ignore
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
  
  async validateOrCreateUser(logCmd: LoginRequest, regCmd: CreateRequest) {
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
      throw new AuthenticationError(e.message);
    }
  }
}
