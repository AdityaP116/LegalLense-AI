/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-citation-code text-[11px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]",
        secondary:
          "bg-surface-container text-on-surface border border-border",
        outline:
          "text-on-surface border border-input",
        success:
          "bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_10px_rgba(var(--secondary),0.2)]",
        warning:
          "bg-tertiary/20 text-tertiary border border-tertiary/30 shadow-[0_0_10px_rgba(var(--tertiary),0.2)]",
        destructive:
          "bg-error/20 text-error border border-error/30 shadow-[0_0_10px_rgba(var(--error),0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
