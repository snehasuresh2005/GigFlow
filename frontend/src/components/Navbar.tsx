import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../hooks/useTheme';

const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow">
              <span className="text-white font-bold">G</span>
            </div>
            <span>GigFlow</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                  {user?.name}{' '}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-200 capitalize">
                    {user?.role}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
