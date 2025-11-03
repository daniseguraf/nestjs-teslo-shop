import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  fullname: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
