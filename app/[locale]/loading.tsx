import { MatrixLoader } from "@/components/ui/matrix-loader";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <MatrixLoader color="#fafafa" />
    </div>
  );
}
