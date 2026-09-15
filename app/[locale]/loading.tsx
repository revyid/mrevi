import { DotmHex5 } from "@/components/ui/dotm-hex-5";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <DotmHex5 size={42} bloom />
    </div>
  );
}
