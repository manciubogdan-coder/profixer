
export type UserRole = "client" | "professional" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
  country: string;
  county: string;
  city: string;
  address: string;
  avatar_url?: string;
}
