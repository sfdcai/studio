"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      "flex h-screen flex-col bg-sidebar text-sidebar-foreground",
      className
    )}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 border-b border-sidebar-border", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const sidebarMenuButtonVariants = cva(
    "inline-flex w-full items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-sidebar transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
    {
      variants: {
        isActive: {
          true: "bg-sidebar-accent text-sidebar-accent-foreground",
          false: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        },
        size: {
          default: "h-10 px-3 py-2",
        },
      },
      defaultVariants: {
        isActive: false,
        size: "default",
      },
    }
  )

export interface SidebarMenuButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {}

const SidebarMenuButton = React.forwardRef<HTMLAnchorElement, SidebarMenuButtonProps>(
  ({ className, isActive, size, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ isActive, size, className }))}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto border-t border-sidebar-border", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("my-2 border-sidebar-border", className)}
    {...props}
  />
))
SidebarSeparator.displayName = "SidebarSeparator"


export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
}
