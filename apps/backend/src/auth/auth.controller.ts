import { SignIn, SignUp } from '@cms/itarface';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}
  //login
  @Post('signup')
  signup(@Body() dto: SignUp) {
    return this.service.signup(dto);
  }

  //registration
  @Post('signin')
  signin(@Body() dto: SignIn) {
    return this.service.signin(dto);
  }

  @Post('activate/:link')
  activate() {
    return 0;
  }

  @Post('refresh')
  refresh() {
    return 0;
  }
}
