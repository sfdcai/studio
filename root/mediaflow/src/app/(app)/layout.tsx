import Nav from "@/components/nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <Nav />
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
}
