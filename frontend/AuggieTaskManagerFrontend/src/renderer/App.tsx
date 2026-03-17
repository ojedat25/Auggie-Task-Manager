import { SignUpLayout } from './components/layout/SignUpLayout';
import { MemoryRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthService } from './features/auth/services/authService';
import Login from './features/auth/components/Login';
import LoginLayout from './components/layout/LogInLayout';
import DashboardLayout from './components/layout/DashboardLayout';

export const ProtectedRoute = () => {
  if (!AuthService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function App() {
  return (
    <MemoryRouter initialEntries={['/login']}> {/* <-- Start at /login */}
      <Routes>
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />} />
        </Route>

        {/* Public routes */}
        <Route path="/login" element={<LoginLayout />} />
        <Route path="/signup" element={<SignUpLayout />} />

        {/* Default/fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
