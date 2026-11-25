// Adapted from https://ui.shadcn.com/r/styles/new-york-v4/textarea.json (MIT)
// Upstream source SHA-256: 5cafcfeeee29534f449387a16b585f5923d2faab1a0cdc50a874416b175f59ce
import { useFieldFeedback } from "./form-feedback"
import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const feedback = useFieldFeedback(props.name, props["aria-describedby"])
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-background px-3 py-2 text-base shadow-xs motion-safe:transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
      {...feedback}
    />
  )
}

export { Textarea }
