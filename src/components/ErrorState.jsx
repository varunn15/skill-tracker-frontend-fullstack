import { AlertCircle, RefreshCw } from 'lucide-react';

function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't complete your request. Please try again.",
  onRetry,
  retryText = "Try Again"
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/30 max-w-md mx-auto">
      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <button 
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5" 
          onClick={onRetry}
        >
          <RefreshCw className="w-4 h-4" /> {retryText}
        </button>
      )}
    </div>
  );
}

export default ErrorState;