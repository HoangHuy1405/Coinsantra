"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/shadcn/card";
import { useSearchParams } from "next/navigation";
import VerifyForm from "./VerifyForm";

export default function VerifyCard() {
  const email = useSearchParams().get("email");

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold">
          Verify Your Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          We sent a 6-digit code to {email ?? "your email"}.
        </p>
        <VerifyForm />
      </CardContent>
    </Card>
  );
}
