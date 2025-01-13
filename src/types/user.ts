export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  plate_number: string;
  vehicle_model: string;
  avatar_url: string | null;
  isAdmin: boolean;
  created_at: string;
}