import { IsNotEmpty } from 'class-validator';

export class SignUp {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  password: string;
}
