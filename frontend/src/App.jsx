import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, fetchNotifications } from './store/slices/authSlice';
import { setNotification } from './store/slices/bidSlice';
import { setupSocket, reconnectSocket } from './utils/socket';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateGig from './pages/CreateGig';
import MyGigs from './pages/MyGigs';
import ActiveGigs from './pages/MyHiredGigs';
import GigDetails from './pages/GigDetails';
import NotificationToast from './components/NotificationToast';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    // Setup Socket.io connection and fetch notifications if authenticated
    if (isAuthenticated) {
      // Setup socket connection with authentication
      const socket = setupSocket(dispatch);
      
      // Fetch notifications and show unread ones
      dispatch(fetchNotifications()).then((result) => {
        if (fetchNotifications.fulfilled.match(result)) {
          const unreadNotifications = result.payload.filter(n => !n.read);
          // Show the most recent unread notification
          if (unreadNotifications.length > 0) {
            const latestNotification = unreadNotifications[0];
            dispatch(setNotification({
              type: latestNotification.type === 'hired' ? 'success' : 'info',
              message: latestNotification.message
            }));
          }
        }
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen bg-[#EDE7F6]">
      <Navbar />
      <NotificationToast />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isAuthenticated ? 'ml-64' : ''} container mx-auto px-4 py-8`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
            />
            <Route 
              path="/create-gig" 
              element={isAuthenticated ? <CreateGig /> : <Navigate to="/" />} 
            />
            <Route 
              path="/my-gigs" 
              element={isAuthenticated ? <MyGigs /> : <Navigate to="/" />} 
            />
            <Route 
              path="/my-active-gigs" 
              element={isAuthenticated ? <ActiveGigs /> : <Navigate to="/" />} 
            />
            <Route path="/gig/:id" element={<GigDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
