import { io } from 'socket.io-client';
import { setNotification, addNewBid } from '../store/slices/bidSlice';
import { fetchActiveGigs } from '../store/slices/gigSlice';
import { fetchNotifications } from '../store/slices/authSlice';
import { store } from '../store/store';
import { baseURL } from './api';

let socket = null;

/**
 * Get authentication token from cookies
 */
const getAuthToken = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

/**
 * Get the current socket instance (if connected)
 */
export const getSocket = () => {
  return socket;
};

/**
 * Setup Socket.io connection with authentication
 */
export const setupSocket = (dispatch) => {
  // Return existing socket if already connected
  if (socket && socket.connected) {
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const token = getAuthToken();
  if (!token) {
    console.warn('No authentication token found. Socket connection may fail.');
  }

  // Connect to Socket.io server with authentication
  socket = io(baseURL, {
    withCredentials: true,
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Connected to Socket.io server');
    console.log('Socket ID:', socket.id);

    // User automatically joins their room on backend after authentication
    // No need to manually join here
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error.message);
    if (error.message.includes('Authentication')) {
      console.warn('Authentication failed. User may need to login again.');
    }
  });

  // Handle real-time notification when freelancer is hired
  socket.on('bidHired', (data) => {
    console.log('📬 Received bidHired notification:', data);

    // Get current user from store
    const state = store.getState();
    const currentUserId = state.auth.user?.id || state.auth.user?._id;

    // Verify this notification is for the current user
    if (currentUserId && String(data.freelancerId) === String(currentUserId)) {
      // Show notification toast
      dispatch(setNotification({
        type: 'success',
        message: data.message || `You have been hired for "${data.gigTitle}"!`
      }));

      // Refresh active gigs list to show the new hire (always refresh, even if not on the page)
      dispatch(fetchActiveGigs());

      // Refresh notifications
      dispatch(fetchNotifications());

      console.log(`✅ Notification displayed for user ${currentUserId}`);
    } else {
      console.log(`⚠️ Notification ignored - not for current user (${currentUserId})`);
    }
  });

  // Handle new bid notifications for gig owners
  socket.on('newBid', (data) => {
    console.log('📬 Received newBid notification:', data);

    const state = store.getState();
    const currentUserId = state.auth.user?.id || state.auth.user?._id;

    // Only show notification if user is the gig owner
    if (currentUserId && String(data.ownerId) === String(currentUserId)) {
      // Add the new bid to the bids list
      dispatch(addNewBid(data.bid));

      // Show notification
      dispatch(setNotification({
        type: 'info',
        message: data.message || `New bid received for "${data.gigTitle}"`
      }));
    }
  });

  // Handle gig assigned notification for gig owners
  socket.on('gigAssigned', (data) => {
    console.log('📬 Received gigAssigned notification:', data);

    const state = store.getState();
    const currentUserId = state.auth.user?.id || state.auth.user?._id;

    // Show notification
    dispatch(setNotification({
      type: 'success',
      message: data.message || `You have hired ${data.freelancerName} for "${data.gigTitle}"`
    }));

    // Note: The GigDetails component will handle refreshing the data via its own socket listener
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from Socket.io server. Reason:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconnected to Socket.io server after ${attemptNumber} attempts`);
  });

  socket.on('pong', (data) => {
    console.log('🏓 Pong received:', data);
  });

  return socket;
};

/**
 * Disconnect Socket.io connection
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket.io disconnected');
  }
};

/**
 * Reconnect Socket.io (useful after login)
 */
export const reconnectSocket = (dispatch) => {
  disconnectSocket();
  return setupSocket(dispatch);
};
