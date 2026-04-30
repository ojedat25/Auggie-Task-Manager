import { useState } from 'react';
import { NavBar } from '../common/NavBar';
import { SideBar } from '../common/SideBar';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertCard } from '../common/AlertCard';
import { StudyGroupList } from '../../features/studygroups/components/studyGroupsList';
import { SettingsScreen } from '../../features/dashboard/components/Settings';
import { AuthService } from '../../features/auth/services/authService';

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
import { StudyGroupForm } from '../../features/studygroups/components/StudyGroupForm';
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
  const [editingGroupID, setEditingGroupID] = useState<number | null>(null); // The ID of the study group being edited, or null if not editing
  const [message, setMessage] = useState<string | null>(null); // The message to be displayed in the AlertCard
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // The error message to be displayed in the AlertCard
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { logOut, error } = useAuth();
  const studyGroupKey = AuthService.getCurrentUser()?.user?.id || 'guest';

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

  const handleSidebarItemChange = (item: string) => {
    setActiveItem(item);
    setDrawerOpen(false);
  };

  // Derive the navbar title from the active sidebar item (and normalize sub-pages)
  const navTitle = activeItem.startsWith('Study Groups')
    ? 'Study Groups'
    : activeItem;

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
        return <Tasks />;
      case 'Task Calendar':
        return <TaskCalendar />;
      case 'Study Groups':
        return (
          <div className="p-4">
            <StudyGroupList
              key={`study-groups-${studyGroupKey}`}
              onCreateClick={() => setActiveItem('Study Groups Create')}
              onEditClick={(groupID) => {
                setEditingGroupID(groupID);
                setActiveItem('Study Groups Edit');
              }}
            />
          </div>
        );
      case 'Study Groups Create':
        return (
          <StudyGroupForm
            key="study-group-form-create"
            onBack={async () => {
              setActiveItem('Study Groups');
            }}
          />
        );
      case 'Study Groups Edit':
        return (
          <StudyGroupForm
            key={`study-group-form-edit-${editingGroupID}`}
            groupID={editingGroupID}
            onBack={() => setActiveItem('Study Groups')}
          />
        );
      default:
        return <div className="p-4">Page Content</div>;
    }
  };

  return (
    <>
      {message && (
        <AlertCard
          type="success"
          message={message}
          onDismiss={() => setMessage(null)}
        />
      )}
      {errorMessage && (
        <AlertCard
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}
      <div className="drawer lg:drawer-open">
        <input
          id="my-drawer-4"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={(e) => setDrawerOpen(e.target.checked)}
        />
        <div className="drawer-content">
          {/* Navbar */}
          <NavBar
            title={navTitle}
            drawerOpen={drawerOpen}
            onDrawerOpenChange={setDrawerOpen}
          />
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
              setActiveItem={handleSidebarItemChange}
              drawerOpen={drawerOpen}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
