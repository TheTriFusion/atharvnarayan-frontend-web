import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
