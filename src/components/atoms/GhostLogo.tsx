"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/ghost-finance-logo.png";

export const GhostLogo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex items-center select-none w-fit h-8", className)}>
      <Image
        src={logoImg}
        alt="Ghost Finance"
        className="h-full w-auto object-contain"
        priority
      />
    </div>
  );
};
