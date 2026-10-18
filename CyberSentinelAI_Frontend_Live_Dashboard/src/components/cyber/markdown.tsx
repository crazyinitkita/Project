"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("md-body text-sm text-foreground/90", className)}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
