import { useState } from 'react';
import { NavBar } from '../common/NavBar';
import { SideBar } from '../common/SideBar';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertCard } from '../common/AlertCard';
import { SettingsScreen } from '../../features/dashboard/components/Settings';

import {
  Menu,
  Settings,
  CircleUserRound,
  ListIcon,
  CalendarIcon,
  UsersRound,
  LogOut,
} from 'lucide-react';
import { Tasks } from '../../features/tasks/components/Tasks';
import { Profile } from '../../features/profile/components/Profile';
import { Homepage } from '../../features/dashboard/components/Homepage';
import { TaskCalendar } from '../../features/dashboard/components/TaskCalendar';
export const DashboardLayout = () => {
  // Sidebar items to be used in the SideBar component
  const sideBarItems = [
    { name: 'Homepage', icon: Menu },
    { name: 'Settings', icon: Settings },
    { name: 'Profile', icon: CircleUserRound },
    { name: 'Task List', icon: ListIcon },
    { name: 'Task Calendar', icon: CalendarIcon },
    { name: 'Study Groups', icon: UsersRound },
    { name: 'Logout', icon: LogOut },
  ];

  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>('Homepage'); // The active item in the sidebar
  const [message, setMessage] = useState<string | null>(null); // The message to be displayed in the AlertCard
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // The error message to be displayed in the AlertCard

  const { logOut, error } = useAuth();

  // Handle the logout action
  const handleLogout = async () => {
    const result = await logOut();
    if (result?.message) {
      setMessage(result.message);
      setTimeout(() => navigate('/login'), 1000); // Navigate to the login page after 1 second
    } else {
      setErrorMessage(error ?? 'Logout failed'); // Set the error message to the error
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Profile':
        return <Profile />;
      case 'Homepage':
        return (
          <Homepage
            onViewAllTasks={() => setActiveItem('Task List')}
            onViewCalendar={() => setActiveItem('Task Calendar')}
          />
        );
      case 'Settings':
        return <SettingsScreen />;
      case 'Task List':
        return (
          <div className="p-4">
            <Tasks />
          </div>
        );
      case 'Task Calendar':
        return (
          <div className="p-4">
            <TaskCalendar />
          </div>
        );
      case 'Study Groups':
        return <div className="p-4">Study Groups content</div>;
      default:
        return <div className="p-4">Page Content</div>;
    }
  };

  return (
    <>
      {message && <AlertCard type="success" message={message} />}
      {errorMessage && <AlertCard type="error" message={errorMessage} />}
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Navbar */}
          <NavBar title="Dashboard" />
          {/* Page content here */}
          <div className="p-4">{renderContent()}</div>
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
            {/* Sidebar content here */}
            <SideBar
              handleLogout={handleLogout}
              sideBarItems={sideBarItems}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
