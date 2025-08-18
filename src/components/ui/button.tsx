import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "glassmorphism-btn text-primary-foreground hover:shadow-glow",
        destructive:
          "glassmorphism-btn bg-destructive/20 text-destructive hover:shadow-red-glow hover:bg-destructive/30",
        outline:
          "glassmorphism-btn border border-input hover:bg-accent/20 hover:text-accent-foreground hover:border-primary/50",
        secondary:
          "glassmorphism-btn bg-secondary/20 text-secondary hover:shadow-red-glow hover:bg-secondary/30",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground glassmorphism-btn bg-transparent",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow bg-transparent backdrop-filter-none border-0 shadow-none",
        premium: "gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 shadow-medium font-semibold",
        elegant: "glassmorphism-card text-card-foreground border border-border hover:shadow-medium",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
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
