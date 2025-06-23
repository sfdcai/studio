"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Folder, Sparkles, FileText, Settings, LogOut, Film } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/files", icon: Folder, label: "File Explorer" },
  { href: "/summarize", icon: Sparkles, label: "AI Summarize" },
  { href: "/logs", icon: FileText, label: "Logs" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Film className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">MediaFlow</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt="@user" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">User</span>
              <span className="text-xs text-muted-foreground">user@mediaflow.com</span>
            </div>
          </div>
          <Link href="/login" legacyBehavior passHref>
             <Button variant="ghost" size="icon" className="h-8 w-8">
                <LogOut className="h-4 w-4"/>
             </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
