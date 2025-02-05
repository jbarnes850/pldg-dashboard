export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner />
        <p className="text-sm text-gray-600">Loading cohort data...</p>
      </div>
    </div>
  );
} 