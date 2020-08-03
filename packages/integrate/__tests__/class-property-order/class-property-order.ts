interface Container {
  logger: { child: (data: { component: string }) => () => void }
}

export class Base<C extends Container = Container> {
  readonly log = this.container.logger.child({ component: this.constructor.name })

  constructor(protected readonly container: C) {}
}
