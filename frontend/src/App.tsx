import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LeadDetail from './pages/LeadDetail';
import CreateLead from './pages/CreateLead';
import EditLead from './pages/EditLead';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main
          className={`flex-1 container mx-auto px-4 py-8 ${
            isAuthenticated ? 'md:ml-64' : ''
          }`}
        >
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/new"
              element={
                <ProtectedRoute>
                  <CreateLead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <LeadDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id/edit"
              element={
                <ProtectedRoute>
                  <EditLead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
