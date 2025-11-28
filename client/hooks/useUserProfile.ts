"use client";
import { useUserService } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useUserProfile() {
  const userService = useUserService();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      try {
        const user = await userService.getProfile();
        console.log("Fetched user profile:", user);
        return user;
      } catch (error: any) {
        toast.error("Failed to load profile");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1,
  });
}
