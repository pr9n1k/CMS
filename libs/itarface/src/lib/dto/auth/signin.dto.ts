import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignIn {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  alias: string;
}
