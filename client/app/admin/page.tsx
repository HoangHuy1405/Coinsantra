import { authOptions } from "@/lib/auth-option";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  //   const { data: session, status } = useSession();
  //   const session = await getServerSession(authOptions);

  //   console.log(session);

  //   if (!session || !session.user.roles.includes("ADMIN")) {
  //     redirect("/");
  //   }

  return <div>This is admin page</div>;
}
