import api from "@/lib/api";
import { ApiResponse } from "@/lib/type";

// ---------- Types ----------

export type RegisterRequest = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNum: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullname: string;
    avatarUrl: string | null;
    roles: string[];
  };
};

export type RefreshResponse = LoginResponse;

export const AuthService = {
  async register(payload: RegisterRequest): Promise<ApiResponse<null>> {
    const { data } = await api.post<ApiResponse<null>>(
      "/auth/register",
      payload,
    );
    return data;
  },
  async activate(token: string) {
    await api.post<ApiResponse<null>>("/auth/activate", {
      token,
    });
  },

  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload,
    );
    return data;
  },

  async refresh(): Promise<ApiResponse<RefreshResponse>> {
    const { data } =
      await api.post<ApiResponse<RefreshResponse>>("/auth/refresh");
    return data;
  },
  async loginGoogle(idToken: String): Promise<ApiResponse<LoginResponse>> {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "auth/social/google",
      { idToken },
    );
    return data;
  },
  // doesnt work
  // async logout(): Promise<void> {
  //   await authApi.post("/auth/logout");
  // },
};
