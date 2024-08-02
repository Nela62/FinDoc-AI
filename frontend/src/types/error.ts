export class BaseError extends Error {
  fnName: string;
  fnInputs: Record<string, any>;
  fnStack: string[];

  constructor(
    message: string,
    fnName: string,
    fnInputs: Record<string, any>,
    fnStack: string[],
  ) {
    super(message);
    this.name = 'BaseError';
    this.fnName = fnName;
    this.fnInputs = fnInputs;
    this.fnStack = fnStack;
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class AuthenticationError extends BaseError {
  status?: number;
  code?: string;

  constructor(
    message: string,
    fnName: string,
    fnInputs: Record<string, any>,
    fnStack: string[],
    status?: number,
    code?: string,
  ) {
    super(message, fnName, fnInputs, fnStack);
    this.name = 'AuthenticationError';
    this.status = status;
    this.code = code;
  }

  addToStack(fnName: string): this {
    this.fnStack.push(fnName);
    return this;
  }
}

export class DatabaseError extends BaseError {
  sql: string;

  constructor(
    message: string,
    fnName: string,
    fnInputs: Record<string, any>,
    fnStack: string[],
    sql: string,
  ) {
    super(message, fnName, fnInputs, fnStack);
    this.sql = sql;
  }
}
