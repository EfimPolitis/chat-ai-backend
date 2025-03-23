import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private isDev: boolean;

  constructor(private configService: ConfigService) {
    this.isDev = this.configService.get('NODE_ENV') !== 'production';
    setTimeout(
      () =>
        console.log(
          this.isDev ? '\nRunning in dev mode' : '\nRunning in productin mode',
        ),
      2000,
    );
  }

  getIsDev(): boolean {
    return this.isDev;
  }
}
