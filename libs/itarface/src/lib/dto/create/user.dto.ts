import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class User {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  alias: string;
}
