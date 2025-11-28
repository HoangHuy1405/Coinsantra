import api from "@/lib/api";
import { ApiResponse } from "@/services/constants/type";

// ---------- Types ----------

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
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
export interface RegisterResponse {
  id: string;
  email: string;
  urlToken: string;
  createdAt: string;
}

export type RefreshResponse = LoginResponse;

export const AuthService = {
  async register(
    payload: RegisterRequest,
  ): Promise<ApiResponse<RegisterResponse>> {
    const { data } = await api.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      payload,
    );
    return data;
  },
  async activate(urlToken: string, activateCode: string) {
    await api.post<ApiResponse<null>>("/auth/activate", {
      urlToken,
      activateCode,
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
