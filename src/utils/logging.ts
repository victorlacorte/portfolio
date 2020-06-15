export namespace LoggingUtils {
  export class Logger {
    private _entries: string[] = [];

    get entries(): string {
      return this._entries.join('\n');
    }

    set entries(entry: string) {
      this._entries.push(entry);
    }
  }
}
