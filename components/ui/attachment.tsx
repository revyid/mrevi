import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { mergeProps } from "@base-ui/react/merge-props"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done"
type AttachmentSize = "default" | "sm" | "xs"
type AttachmentOrientation = "horizontal" | "vertical"
type AttachmentMediaVariant = "icon" | "image"

/* -------------------------------------------------------------------------- */
/*  Attachment (root)                                                         */
/* -------------------------------------------------------------------------- */

interface AttachmentProps extends React.ComponentProps<"div"> {
  state?: AttachmentState
  size?: AttachmentSize
  orientation?: AttachmentOrientation
}

function Attachment({
  className,
  state = "done",
  size = "default",
  orientation = "horizontal",
  ...props
}: AttachmentProps) {
  return (
    <div
      data-slot="attachment"
      data-state={state}
      data-size={size}
      data-orientation={orientation}
      className={cn(
        "group/attachment relative flex items-center gap-3 overflow-hidden rounded-xl border bg-background p-3 ring-1 ring-black/5 transition-colors",
        orientation === "vertical" && "flex-col",
        size === "sm" && "gap-2.5 p-2.5",
        size === "xs" && "gap-2 p-2",
        state === "error" &&
          "border-destructive/40 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  AttachmentMedia                                                           */
/* -------------------------------------------------------------------------- */

interface AttachmentMediaProps extends React.ComponentProps<"div"> {
  variant?: AttachmentMediaVariant
}

function AttachmentMedia({
  className,
  variant = "icon",
  children,
  ...props
}: AttachmentMediaProps) {
  return (
    <div
      data-slot="attachment-media"
      data-variant={variant}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground",
        variant === "image" && "size-12 rounded-xl",
        "[&>svg]:size-5 [&>img]:size-full [&>img]:object-cover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  AttachmentContent                                                         */
/* -------------------------------------------------------------------------- */

function AttachmentContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  AttachmentTitle                                                           */
/* -------------------------------------------------------------------------- */

function AttachmentTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-title"
      className={cn(
        "truncate text-sm font-medium leading-none",
        "in-data-[state=uploading]:animate-shimmer in-data-[state=processing]:animate-shimmer",
        "in-data-[state=uploading]:bg-gradient-to-r in-data-[state=uploading]:from-muted-foreground/20 in-data-[state=uploading]:via-muted-foreground/40 in-data-[state=uploading]:to-muted-foreground/20 in-data-[state=uploading]:bg-[length:200%_100%] in-data-[state=uploading]:bg-clip-text in-data-[state=uploading]:text-transparent",
        "in-data-[state=processing]:bg-gradient-to-r in-data-[state=processing]:from-muted-foreground/20 in-data-[state=processing]:via-muted-foreground/40 in-data-[state=processing]:to-muted-foreground/20 in-data-[state=processing]:bg-[length:200%_100%] in-data-[state=processing]:bg-clip-text in-data-[state=processing]:text-transparent",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  AttachmentDescription                                                     */
/* -------------------------------------------------------------------------- */

function AttachmentDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-description"
      className={cn(
        "truncate text-xs text-muted-foreground",
        "in-data-[state=error]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  AttachmentActions                                                         */
/* -------------------------------------------------------------------------- */

function AttachmentActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn(
        "flex shrink-0 items-center gap-0.5",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  AttachmentAction                                                          */
/* -------------------------------------------------------------------------- */

interface AttachmentActionProps
  extends React.ComponentProps<typeof Button> {}

function AttachmentAction({
  size = "icon-xs",
  className,
  ...props
}: AttachmentActionProps) {
  return (
    <Button
      data-slot="attachment-action"
      size={size}
      variant="ghost"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  AttachmentTrigger                                                         */
/* -------------------------------------------------------------------------- */

interface AttachmentTriggerProps extends React.ComponentProps<"button"> {
  render?: useRender.RenderProp
}

function AttachmentTrigger({
  className,
  render,
  ...props
}: AttachmentTriggerProps) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: "button",
        className: cn(
          "absolute inset-0 z-0 cursor-pointer appearance-none border-none bg-transparent",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "attachment-trigger",
    },
  })
}

/* -------------------------------------------------------------------------- */
/*  AttachmentGroup                                                           */
/* -------------------------------------------------------------------------- */

function AttachmentGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-group"
      className={cn(
        "flex gap-2 overflow-x-auto scroll-px-1 pb-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [&[scrollbar-width]]:scrollbar-none",
        className
      )}
      {...props}
    />
  )
}

export {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
  AttachmentGroup,
}

export type {
  AttachmentProps,
  AttachmentMediaProps,
  AttachmentActionProps,
  AttachmentTriggerProps,
}
