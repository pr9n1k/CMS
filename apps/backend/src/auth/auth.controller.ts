import { SignIn, SignUp } from '@cms/itarface';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}
  //login
  @Post('signup')
  async signup(
    @Body() dto: SignUp,
    @Res({ passthrough: true }) response: Response
  ) {
    const data = await this.service.signup(dto);
    response.cookie('refreshToken', data.refresh_token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return data;
  }

  //registration
  @Post('signin')
  async signin(
    @Body() dto: SignIn,
    @Res({ passthrough: true }) response: Response
  ) {
    const data = await this.service.signin(dto);
    response.cookie('refreshToken', data.refresh_token, {
      // maxAge: 30 * 24 * 60 * 60 * 1000,
      maxAge: 60 * 1000,
      httpOnly: true,
    });
    return data;
  }

  @Post('/logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.cookies['refreshToken'];
    const token = await this.service.logout(refreshToken);
    response.clearCookie('refreshToken');
    return token;
  }

  @Post('activate/:link')
  activate() {
    return 0;
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res() response: Response) {
    const refreshToken = request.cookies['refreshToken'];
    const data = await this.service.refresh(refreshToken);
    response.cookie('refreshToken', data.refresh_token, {
      // maxAge: 30 * 24 * 60 * 60 * 1000,
      maxAge: 60 * 1000,
      httpOnly: true,
    });
    return response.json(data);
  }
  @Post('get-token')
  get() {
    return this.service.getToken();
  }
}
