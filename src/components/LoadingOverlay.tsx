export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CDFF63] border-t-transparent"></div>
          <p className="mt-4 text-sm text-white/80">Uploading image...</p>
        </div>
      </div>
    </div>
  );
}
