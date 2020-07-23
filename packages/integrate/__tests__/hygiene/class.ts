const DURATION = 1000

export class HygieneTest {
  private readonly duration: number = DURATION

  constructor(duration?: number) {
    this.duration = duration ?? DURATION
  }

  getDuration() {
    return this.duration
  }
}
