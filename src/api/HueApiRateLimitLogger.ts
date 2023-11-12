import Bottleneck from 'bottleneck';

export class HueApiRateLimitLogger {

  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  static install(name: string, bottleneck: Bottleneck) {}
}