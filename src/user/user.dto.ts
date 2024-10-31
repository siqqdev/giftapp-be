
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Matches(/^\d+$/, { 
      message: 'Telegram ID must be a valid numeric string'
  })
  id: string;
}