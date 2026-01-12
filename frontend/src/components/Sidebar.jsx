import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyGigs } from '../store/slices/gigSlice';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { myGigs } = useSelector((state) => state.gigs);
  
  const gigCount = myGigs?.length || 0;
  const maxGigs = 3;
  const canCreateGig = gigCount < maxGigs;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyGigs());
    }
  }, [dispatch, isAuthenticated]);

  const menuItems = [
    {
      path: '/',
      label: 'Browse Gigs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    ...(isAuthenticated ? [
      {
        path: '/my-gigs',
        label: 'My Gigs',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        path: '/my-active-gigs',
        label: 'Active Gigs',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      }
    ] : [])
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-64 bg-white shadow-xl border-r border-purple-100 h-[calc(100vh-4rem)] fixed left-0 top-16 z-10 overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-sm text-gray-600 font-medium">{user?.name}</p>
          <p className="text-xs text-gray-500 mt-2 px-3 py-1.5 bg-purple-50 rounded-xl inline-block">
            {gigCount}/{maxGigs} gigs posted
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-purple-100 text-purple-700 font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-purple-50 hover:shadow-sm'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-purple-100">
          {canCreateGig ? (
            <Link
              to="/create-gig"
              className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-bold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Post a Gig</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gray-200 text-gray-400 rounded-2xl cursor-not-allowed font-medium"
                title="You have reached the maximum limit of 3 gigs"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Post a Gig</span>
              </button>
              <p className="text-xs text-gray-500 text-center">
                Maximum limit reached (3/3)
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
