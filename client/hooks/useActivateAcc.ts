"use client";

import { AuthService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function useActivateAcc() {
  const router = useRouter();

  return useMutation({
    mutationFn: (code: string) => AuthService.activate(code),
    onSuccess: () => {
      toast.success("Account activated! You can now log in.");
      router.push("/login");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail || "Invalid or expired code.";
      toast.error(`❌ ${message}`);
    },
  });
}
