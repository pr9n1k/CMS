import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { queryPagination, updateUser, User } from '@cms/itarface';
import { PrismaService } from 'nestjs-prisma';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(dto: User) {
    const candidateForEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (candidateForEmail) {
      throw new HttpException(
        `Аккаунт с таким email ${dto.email} уже зарегистрирован`,
        HttpStatus.BAD_REQUEST
      );
    }
    const candidateForAlies = await this.prisma.user.findUnique({
      where: { alias: dto.alias },
    });
    if (candidateForAlies) {
      throw new HttpException(
        `Аккаунт с таким ником ${dto.alias} уже зарегистрирован`,
        HttpStatus.BAD_REQUEST
      );
    }
    return await this.prisma.user.create({
      data: {
        ...dto,
      },
    });
  }
  async get(query?: queryPagination) {
    const total = await this.prisma.user.count();
    const limit =
      !parseInt(query.limit) || query.limit === '-1'
        ? total
        : parseInt(query.limit);
    const page =
      parseInt(query.limit) && parseInt(query.page) ? parseInt(query.page) : 0;
    const users = await this.prisma.user.findMany({
      skip: page * limit,
      take: limit,
    });
    return { value: users, total };
  }
  async getById(id: number) {
    if (!id) {
      throw new HttpException('Id не указан', HttpStatus.BAD_REQUEST);
    }
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
  async update(id: number, dto: updateUser) {
    if (dto.alias) {
      const candidateForAlias = await this.prisma.user.findUnique({
        where: {
          alias: dto.alias,
        },
      });
      if (candidateForAlias && candidateForAlias.id !== id) {
        throw new HttpException(
          `Такой ник ${dto.alias} уже присвоен другому аккаунту`,
          HttpStatus.BAD_REQUEST
        );
      }
    }
    if (dto.email) {
      const candidateForEmail = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (candidateForEmail && candidateForEmail.id !== id) {
        throw new HttpException(
          `Такой email ${dto.email} уже присвоен другому аккаунту`,
          HttpStatus.BAD_REQUEST
        );
      }
    }
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }
  async remove(id: number) {
    return await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
