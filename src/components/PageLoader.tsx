import React from "react";

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4" role="status" aria-label="Memuat konten...">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <p className="text-xs font-medium text-muted-foreground tracking-wide animate-pulse">
        Memuat halaman...
      </p>
    </div>
  );
};

export default PageLoader;
