export interface ClockProvider {
  now(): Date;
}

export class SystemClockProvider implements ClockProvider {
  now() {
    return new Date();
  }
}
