/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] hover:-translate-y-0.5 active:translate-y-0 border border-primary/20",
        secondary:
          "bg-surface-container-low text-on-surface hover:bg-surface-container shadow-sm active:translate-y-px border border-border/50",
        outline:
          "border border-input bg-transparent hover:bg-surface-container hover:text-on-surface",
        ghost: "hover:bg-surface-container hover:text-on-surface",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-gradient-to-r from-error to-error-container text-on-error shadow-[0_0_15px_rgba(var(--error),0.3)] hover:shadow-[0_0_25px_rgba(var(--error),0.5)] hover:-translate-y-0.5 active:translate-y-0 border border-error/20",
      },
      size: {
        default: "h-9 px-space-md py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-space-xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
