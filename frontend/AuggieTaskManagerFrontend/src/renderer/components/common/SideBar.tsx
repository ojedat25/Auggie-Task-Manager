import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
export type SideBarItem = { name: string; icon: LucideIcon };

interface SideBarProps {
  sideBarItems: SideBarItem[];
  activeItem: string | null;
  setActiveItem: (item: string) => void;
  handleLogout: () => Promise<void>;
  drawerOpen: boolean;
}

export const SideBar = ({
  sideBarItems,
  activeItem,
  setActiveItem,
  handleLogout,
  drawerOpen,
}: SideBarProps) => {
  const [tooltipsArmed, setTooltipsArmed] = useState(false);

  useEffect(() => {
    if (!drawerOpen) {
      setTooltipsArmed(false);
    }
  }, [drawerOpen]);

  // Handle the click event for the sidebar items
  const handleItemClick = (item: string) => {
    setTooltipsArmed(false);
    if (item === 'Logout') {
      handleLogout();
      return;
    }
    setActiveItem(item); // Set the active item to the item that was clicked
  };
  const isActive = (item: string) => activeItem === item; // Check if the item is active

  const getIconColor = (item: string) =>
    isActive(item) ? 'text-white' : 'text-gray-500'; // Get the color of the icon based on if the item is active
  const getTextColor = (item: string) =>
    isActive(item) ? 'text-white' : 'text-gray-500'; // Get the color of the text based on if the item is active

  return (
    <ul className="menu w-full grow">
      {/* List item */}
      {sideBarItems.map((item) => (
        <li key={item.name}>
          <button
            className={`${!drawerOpen && tooltipsArmed ? 'tooltip tooltip-right' : ''} ${
              isActive(item.name) ? 'bg-primary text-white' : ''
            }`}
            onClick={() => handleItemClick(item.name)}
            onMouseDown={() => setTooltipsArmed(false)}
            onMouseEnter={() => setTooltipsArmed(true)}
            data-tip={item.name}
          >
            <item.icon
              className={`my-1.5 inline-block size-4 ${getIconColor(item.name)}`}
            />
            <span
              className={`is-drawer-close:hidden whitespace-nowrap truncate ${getTextColor(item.name)}`}
            >
              {item.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
