import { User } from "./Task";

export interface Member {
  user?: User;
  invited_by?: User;
  can_see_time_spent?: boolean;
  can_see_time_estimated?: boolean;
  can_see_points_estimated?: boolean;
  can_edit_tags?: boolean;
  can_create_views?: boolean;
}
