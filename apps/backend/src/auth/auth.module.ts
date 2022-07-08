import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from './../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { JwtStrategy } from './strategy';

@Module({
  providers: [AuthService, UserService, ConfigService, JwtStrategy],
  imports: [JwtModule.register({}), PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
