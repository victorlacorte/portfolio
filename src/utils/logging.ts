namespace LoggingUtils {
  export class Logger {
    private static _instance: Logger;
    private entries = [];

    private constructor() {}

    static instance(): Logger {
      if (!Logger._instance) {
        Logger._instance = new Logger();
      }

      return Logger._instance;
    }

    log(entry: string): void {
      this.entries.push(entry);
    }

    view(): string {
      return this.entries.join('\n');
    }

    // TODO necessary?
    clear(): void {
      this.entries = [];
    }
  }
}
