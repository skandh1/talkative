import { X } from "lucide-react";

export const ErrorBanner = ({ error, onDismiss }: { error: string; onDismiss: () => void }) => (
  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-3">
      <X className="w-5 h-5 text-red-500" />
      <span className="text-red-700 dark:text-red-300">{error}</span>
    </div>
    <button onClick={onDismiss} className="text-red-500 hover:text-red-700">
      <X className="w-4 h-4" />
    </button>
  </div>
);