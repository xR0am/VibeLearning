export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImageUrl?: string;
  openrouterApiKey?: string;
  createdAt: string;
  updatedAt: string;
}