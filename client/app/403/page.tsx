"use client";

import Link from "next/link";
import { ShieldBan, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/shadcn/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto"
      >
        {/* ICON & 403 NUMBER */}
        <div className="mb-8 flex justify-center items-center">
          <span className="text-9xl font-extrabold text-gray-200 select-none">
            403
          </span>
        </div>

        {/* MAIN MESSAGE */}
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Access Denied
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Xin lỗi, bạn không có quyền truy cập vào trang này. <br />
          Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.
        </p>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>

        {/* FOOTER TEXT */}
        <p className="mt-12 text-xs text-gray-400">
          Error Code: 403_FORBIDDEN
        </p>
      </motion.div>
    </div>
  );
}