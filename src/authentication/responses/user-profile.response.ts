import { CountryResponse } from "src/country/response/country.response";
import { RoleResponse } from "src/role/responses/role.response";
import { UserDetailResponse } from "src/users/responses/user-detail-response";

export class UserProfileResponse {
  userId: string;
  email: string;
  name: string;
  lastname: string;
  role: RoleResponse;
  country: CountryResponse | null;
  isActive: boolean;
  userDetail?: UserDetailResponse | null;
  position?: {
    id: string;
    title: string;
    area: {
      id: string;
      name: string;
    } | null;
  } | null;
}