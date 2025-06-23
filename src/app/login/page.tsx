import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary text-primary-foreground p-3 rounded-full">
                <Film className="h-8 w-8" />
              </div>
            </div>
          <CardTitle className="text-2xl">MediaFlow</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">Sign in</Button>
           <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline" prefetch={false}>
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
