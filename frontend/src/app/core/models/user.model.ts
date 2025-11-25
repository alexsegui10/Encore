export interface User {
  uid?: string;
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
  role?: string;
  following?: boolean;
}
