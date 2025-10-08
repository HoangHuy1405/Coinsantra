"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../shadcn/card";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Separator } from "../shadcn/separator";
import { motion, AnimatePresence } from "framer-motion";
import { GithubButton, GoogleButton } from "./OAuth2Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

type mode = "login" | "register";

export default function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<mode>("login");

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "register") {
      setMode("register");
    } else {
      setMode("login");
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { redirect: false, callbackUrl: "/" });
      router.push("/");
      toast.success("Logged in successfully");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error("Failed to login. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          layout
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === "login" ? <LoginForm /> : <RegisterForm />}

            <p className="text-center text-sm text-muted-foreground mt-4">
              {mode === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <Link
                    href="/login?mode=register"
                    className="text-foreground hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login?mode=login"
                    className="text-foreground hover:underline"
                  >
                    Login
                  </Link>
                </>
              )}
            </p>
            <div className="my-4 flex items-center">
              <Separator className="flex-1 border-t" />
              <span className="px-2 bg-card text-sm text-muted-foreground">
                or continue with
              </span>
              <Separator className="flex-1 border-t border-dashed" />
            </div>

            <div className="flex justify-center gap-4 mt-3">
              <GoogleButton onClick={handleGoogleLogin} />
              <GithubButton onClick={() => {}} />
            </div>
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
