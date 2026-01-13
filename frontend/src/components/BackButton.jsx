import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    try {
      navigate(-1);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home if navigation fails
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 font-medium mb-6"
      aria-label="Go back"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>Back</span>
    </button>
  );
};

export default BackButton;
