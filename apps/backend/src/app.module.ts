import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { RoomModule } from './room/room.module';
import { StatusModule } from './status/status.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'nestjs-prisma';
@Module({
  imports: [
    PrismaModule.forRoot({ isGlobal: true }),
    UserModule,
    TaskModule,
    StatusModule,
    RoomModule,
    CommentModule,
    AuthModule,
  ],
})
export class AppModule {}
