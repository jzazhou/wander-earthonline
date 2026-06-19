interface Pendo {
  track(eventName: string, properties?: Record<string, string | number | boolean>): void
}

declare var pendo: Pendo | undefined
