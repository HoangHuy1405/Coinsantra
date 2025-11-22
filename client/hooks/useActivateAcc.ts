"use client";

import { AuthService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function useActivateAcc() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      urlToken,
      activateCode,
    }: {
      urlToken: string;
      activateCode: string;
    }) => AuthService.activate(urlToken, activateCode),
    onSuccess: () => {
      router.push("/login");
      toast.success("Account activated! You can now log in.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail || "Invalid or expired code.";
      toast.error(`❌ ${message}`);
    },
  });
}
