// src/hooks/useUpdateProfile.ts
"use client";

import { useUserService } from "@/hooks/useUserService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ProfileUpdateRequest, UserProfile } from "@/services/userService";
import { ApiResponse } from "@/lib/type";

export function useUpdateProfile() {
    const userService = useUserService();
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<UserProfile>, any, ProfileUpdateRequest>({
        mutationFn: (payload) => userService.updateProfile(payload),
        onSuccess: (res) => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message ?? "Failed to update profile");
        },
    });
}
