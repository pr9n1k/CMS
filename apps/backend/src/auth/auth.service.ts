import { SignIn, SignUp } from '@cms/itarface';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon from 'argon2';
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
    const tokens = await this.signToken(user.id, user.email);
    return { ...tokens };
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
      const tokens = await this.signToken(user.id, user.email);
      return { ...tokens };
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
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_ACCESS_SECRET_EXPIRES_IN'),
      secret: this.config.get('JWT_ACCESS_SECRET'),
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_REFRESH_SECRET_EXPIRES_IN'),
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });
    this.saveRefreshToken(userId, refresh_token);
    return {
      access_token,
      refresh_token,
    };
  }

  async logout(token: string) {
    try {
      return this.prisma.token.deleteMany({
        where: {
          refresh: token,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  // В будущем переписать для массива токенов
  async saveRefreshToken(userId: number, token: string) {
    const thisToken = await this.prisma.token.findFirst({
      where: {
        userId,
      },
    });
    if (!thisToken) {
      return await this.prisma.token.create({
        data: {
          refresh: token,
          userId,
        },
      });
    }
    const data = await this.prisma.token.update({
      where: {
        id: thisToken.id,
      },
      data: {
        refresh: token,
      },
    });
    return data;
  }
  async checkToken(refreshToken: string) {
    const refreshTokenVerify = await this.jwt.verifyAsync(refreshToken, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });
    const email = refreshTokenVerify['email'];
    if (!email) {
      throw new ForbiddenException();
    }
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');
    return user;
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException({
          message: 'Ошибка авторизации',
        });
      }

      const userData = await this.checkToken(refreshToken);
      const tokenFromDb = await this.prisma.token.findFirst({
        where: {
          refresh: refreshToken,
        },
      });
      if (!userData || !tokenFromDb) {
        throw new UnauthorizedException({
          message: 'Ошибка авторизации',
        });
      }

      return await this.signToken(userData.id, userData.email);
    } catch (error) {
      throw new UnauthorizedException({ message: 'Токен умер' });
    }
  }
  async getToken() {
    return await this.prisma.token.findMany();
  }
}
