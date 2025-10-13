"use client";

import { AuthService, RegisterRequest } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => AuthService.register(payload),

    onSuccess: (res) => {
      if (res.statusCode === 201) {
        router.push(`verify?token=${res.data?.urlToken}`);
      } else {
        toast.error(res.message || "Registration failed.");
      }
    },

    onError: (error: any) => {
      console.log(error);
      const message =
        error?.response?.data?.detail || "Something went wrong. Try again.";
      toast.error(`${message}`);
    },
  });
}
