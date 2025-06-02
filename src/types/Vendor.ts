export interface Vendor {
  id: number;
  username: string;
  email: string;
  color: string | null;
  profilePicture: string | null;
  initials: string;
  role: number;
  custom_role: string | null;
  last_active: string;
  date_joined: string;
  date_invited: string;
  reportTemplatePath: string;
}
