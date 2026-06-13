"use client";
import { usePathname } from "next/navigation";
import { Loader } from "./Loader";

export function PageLoader() {
  const pathname = usePathname();
  if (pathname.startsWith("/vault")) return null;
  return <Loader />;
}
