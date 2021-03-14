export class Logger {
  private _entries: string[] = [];

  get entries(): string[] {
    return this._entries;
  }

  join(separator = '\n'): string {
    return this._entries.join(separator);
  }

  add(entry: string): void {
    this._entries.push(entry);
  }
}
