import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-6xl font-bold font-heading">
          <span className="block">404</span>
          <span className="block text-muted-foreground/20">NOT FOUND</span>
        </h1>
        <p className="text-muted-foreground text-[16px]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
