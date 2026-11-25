// Adapted from https://ui.shadcn.com/r/styles/new-york-v4/native-select.json (MIT)
// Upstream source SHA-256: 4bdbce5575dce610fed747df4547a3d494713f4df8d28e09b3ccee62e4d72f93
import { useFieldFeedback } from "./form-feedback"
import * as React from "react"
import { cn } from "@/lib/utils"

function NativeSelect({
  className,
  size,
  ...props
}: React.ComponentProps<"select">) {
  const feedback = useFieldFeedback(props.name, props["aria-describedby"])
  return (
      <select
        data-slot="native-select"
        size={size}
        className={cn(
          "min-h-11 w-full min-w-0 rounded-sm border border-input bg-background px-3 py-2 text-sm shadow-xs motion-safe:transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
        {...feedback}
      />
  )
}

export { NativeSelect }
