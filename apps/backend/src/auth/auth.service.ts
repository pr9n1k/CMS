import { SignIn, SignUp } from '@cms/itarface';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon from 'argon2';
import * as uuid from 'uuid';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'nestjs-prisma';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService
  ) {}
  //login
  async signup(dto: SignUp) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            alias: dto.login,
          },
          {
            email: dto.login,
          },
        ],
      },
    });
    if (!user) {
      throw new HttpException(`Логин не верный`, HttpStatus.BAD_REQUEST);
    }
    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) {
      throw new HttpException(`Пароль не верный`, HttpStatus.BAD_REQUEST);
    }
    return this.signToken(user.id, user.email);
  }
  //reg
  async signin(dto: SignIn) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.userService.create({
        email: dto.email,
        password: hash,
        alias: dto.alias,
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_SECRET_EXPIRES_IN'),
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
