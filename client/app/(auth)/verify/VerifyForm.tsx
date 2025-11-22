"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/shadcn/form";
import { Input } from "../../ui/shadcn/input";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../ui/shadcn/button";
import useActivateAcc from "@/hooks/useActivateAcc";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const verificationSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

export default function VerifyForm() {
  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: ""
    }
  });
  const activate = useActivateAcc();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlToken = searchParams.get("token");

  useEffect(() => {
    if (!urlToken) {
      toast.error("Invalid verification link. Please register again.");
      router.replace("/register");
    }
  }, [urlToken, router]);

  const handleVerify = async (values: z.infer<typeof verificationSchema>) => {
    if (!urlToken) {
      return alert("Invalid or missing token");
    }
    activate.mutate({ urlToken, activateCode: values.code });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input placeholder="123456" maxLength={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={activate.isPending}>
          {activate.isPending ? "Verifying..." : "Verify Account"}
        </Button>
      </form>
    </Form>
  );
}
