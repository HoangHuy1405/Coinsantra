"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/app/ui/shadcn/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/shadcn/avatar";
import { Badge } from "@/app/ui/shadcn/badge";
import { Separator } from "@/app/ui/shadcn/separator";
import { Tabs, TabsList, TabsTrigger } from "../ui/shadcn/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard from "./ProfileCard";
import AccountCard from "./AccountCard";
import SecurityCard from "./SecurityCard";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-4xl p-6 space-y-6">

        {/* Avatar and Basic Info */}
        <div className="flex flex-row items-center space-x-4">
          <Avatar className="h-15 w-15">
            <AvatarImage
              src={
                profile?.avatarUrl ??
                `https://ui-avatars.com/api/?name=${profile?.fullname || profile?.username}&background=random`
              }
              alt={profile?.fullname || profile?.username}
            />
            <AvatarFallback>
              {profile?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center">
            <div
              className="text-3xl font-semibold"
            >
              {profile?.fullname || profile?.username}
            </div>
            <div className="text-sm text-muted-foreground">
              {profile?.email}
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" variant="underline" className="w-full space-y-5 ">
          <TabsList >
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-5">
            <ProfileCard
              profile={profile}
            />
          </TabsContent>

          <TabsContent value="account" className="space-y-5">
            <AccountCard />
          </TabsContent>

          <TabsContent value="security" className="space-y-5">
            <SecurityCard />
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}
