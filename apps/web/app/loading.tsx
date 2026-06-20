import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-orange-200 bg-white p-6 text-orange-700 shadow-sm">
        <Spinner className="h-8 w-8" />
        <p className="text-sm font-semibold">Loading ToolBoxBD...</p>
      </div>
    </div>
  );
}
