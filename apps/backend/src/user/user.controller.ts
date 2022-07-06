import { queryPagination, updateUser, User } from '@cms/itarface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Post('add')
  create(@Body() dto: User) {
    return this.service.create(dto);
  }

  @Get('get')
  get(@Query() query?: queryPagination) {
    return this.service.get(query);
  }

  @Get('get/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(parseInt(id));
  }

  @Put(':id')
  update(@Body() dto: updateUser, @Param('id') id: string) {
    return this.service.update(parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(parseInt(id));
  }
}
