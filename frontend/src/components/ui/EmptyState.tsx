interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="text-center py-16 px-4">
    <div className="text-5xl mb-4">📋</div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && (
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
