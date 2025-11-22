"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/shadcn/card";
import RegisterForm from "./RegisterForm";


export default function RegisterCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold">
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
