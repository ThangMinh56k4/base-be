import { JwtPayload } from 'jsonwebtoken';

export * from './express/custom';

export interface UserPayload extends JwtPayload {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}


export type FacebookUser = {
  id: string;
  name: string;
  email: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    }
  }
}

export type GoogleUser = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}
