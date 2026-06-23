import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: Express.User;
}
