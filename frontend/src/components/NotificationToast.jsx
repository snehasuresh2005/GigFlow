import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../store/slices/bidSlice';

const NotificationToast = () => {
  const { notification } = useSelector((state) => state.bids);
  const dispatch = useDispatch();

  useEffect(() => {
    if (notification) {
      // Show notification longer for important messages like "hired"
      const duration = notification.type === 'success' ? 8000 : 5000;
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-400 shadow-2xl';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-400 shadow-2xl';
      case 'info':
        return 'bg-gradient-to-r from-[#8A2BE2] to-[#9C4EDD] text-white border-2 border-purple-400 shadow-2xl';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-2 border-gray-400 shadow-2xl';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in max-w-md">
      <div className={`px-6 py-4 rounded-3xl ${getNotificationStyles()} flex items-center gap-3 transform transition-all duration-300 hover:scale-105`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg">{notification.message}</p>
        </div>
        <button
          onClick={() => dispatch(clearNotification())}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
