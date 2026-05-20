const LoadingSpinner = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-gray-600 dark:text-gray-400 font-medium">{label}</p>
  </div>
);

export default LoadingSpinner;
