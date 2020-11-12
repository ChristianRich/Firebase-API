import { STATUS_CODES } from 'http';

// Simple error wrapper class
export default class CustomError {
  constructor(status = 500, message = STATUS_CODES[status], code) {
    return {
      message,
      status,
      code,
    };
  }
}
