
import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
}

export class UpdateUserDto {
  @IsString()
  name: string;
}