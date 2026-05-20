interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => (
  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded-xl flex justify-between items-start gap-3">
    <span className="font-medium">{message}</span>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className="text-red-500 hover:text-red-700 shrink-0"
        aria-label="Dismiss error"
      >
        ✕
      </button>
    )}
  </div>
);

export default ErrorAlert;
