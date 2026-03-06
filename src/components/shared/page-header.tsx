"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon = Plus,
  onAction,
  children,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-3">
        {backHref && (
          <button
            onClick={() => router.back()}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <Button size="sm">
              <ActionIcon className="h-4 w-4 mr-1.5" />
              {actionLabel}
            </Button>
          </Link>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm">
            <ActionIcon className="h-4 w-4 mr-1.5" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
