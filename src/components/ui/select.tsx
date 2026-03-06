"use client"

import { cn } from "@/lib/utils"

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SelectItem({ value, children, ...props }: React.ComponentProps<"option">) {
  return <option value={value} {...props}>{children}</option>
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props}>{children}</div>
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  return <>{placeholder}</>
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
