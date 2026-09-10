import { Injectable } from '@nestjs/common';

export interface HealthMessage {
  message: string;
}

@Injectable()
export class AppService {
  getRootMessage(): HealthMessage {
    return { message: 'Pet Grooming API is running' };
  }
}
