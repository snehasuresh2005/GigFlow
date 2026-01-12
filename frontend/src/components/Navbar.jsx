import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md border-b border-purple-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span>GigFlow</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 text-sm">Hello, <span className="font-semibold text-purple-600">{user?.name}</span></span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-gray-700 hover:text-purple-600 transition rounded-xl hover:bg-purple-50 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-gray-700 hover:text-purple-600 transition rounded-xl hover:bg-purple-50 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-[#8A2BE2] text-white rounded-2xl hover:bg-[#7B1FA2] transition font-semibold shadow-md hover:shadow-lg"
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
