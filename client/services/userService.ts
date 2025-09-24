import { ApiResponse } from "@/lib/type";
import { AxiosInstance } from "axios";

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  fullname: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  roles: string[];
};

export type Account = {
  user: UserProfile;
};

export const UserService = (client: AxiosInstance) => ({
  async getProfile() {
    const { data } = await client.get<ApiResponse<Account>>("/user/account");
    console.log("Full API response:", data);
    return data.data?.user; // ✅ unwrap once, return just the user object
  },
});
