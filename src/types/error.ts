export class MessageError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, MessageError.prototype);
  }
}
