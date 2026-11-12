"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MessAdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mess-admin/dashboard");
  }, [router]);

  return null;
}

