import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}
  
  getHello(): string {
    if (this.connection.readyState === 1) {
      return 'Connection to db is established, readyState: ' + this.connection.readyState;
    } else {
      return 'Connection to db is not established, readyState: ' + this.connection.readyState;
    }
  }
}

