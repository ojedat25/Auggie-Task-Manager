/**
 * Main app: routing and global providers.
 * Add React Router and store provider here when ready.
 */
import { SignUpLayout } from './components/layout/SignUpLayout';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthService } from './features/auth/services/authService';
export const ProtectedRoute = () => {
  if (!AuthService.isAuthenticated()) return <Navigate to="/signup" replace />; //change to  "/login" when implemented
  return <Outlet />;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<SignUpLayout />} /> {/* Change to DashboardLayout when ready */}
        </Route>
        <Route path="/signup" element={<SignUpLayout />} />
        <Route path="*" element={<SignUpLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
