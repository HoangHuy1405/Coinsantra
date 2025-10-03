import { ApiResponse } from "@/lib/type";
import { AxiosInstance } from "axios";

export type UserProfile = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNum: string;
  description: string;
  avatarUrl: string | null;
  roles: string[];
};

export const UserService = (client: AxiosInstance) => ({
  async getProfile() {
    const res = await client.get<ApiResponse<UserProfile>>("/users/profile");
    console.log("Full API response2:", res);
    return res.data.data;
  },
});
