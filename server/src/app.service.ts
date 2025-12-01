import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'Outreach API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
