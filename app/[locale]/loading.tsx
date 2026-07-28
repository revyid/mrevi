import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  );
}
