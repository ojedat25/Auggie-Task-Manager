import { useState } from 'react';

import {
  Menu,
  Settings,
  LogOut,
  File,
  List,
  Calendar,
  ListIcon,
  CalendarIcon,
  UngroupIcon,
  CircleUserRound,
  UsersRound,
} from 'lucide-react';

export const SideBar = ({ activeItem, setActiveItem }: { activeItem: string | null, setActiveItem: (item: string) => void }) => {
  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };
  const isActive = (item: string) => activeItem === item;
  const getIconColor = (item: string) =>
    isActive(item) ? 'text-white' : 'text-gray-500';
  const getTextColor = (item: string) =>
    isActive(item) ? 'text-white' : 'text-gray-500';
  const sideBarItems = [
    { name: 'Homepage', icon: Menu },
    { name: 'Settings', icon: Settings },
    { name: 'Profile', icon: CircleUserRound },
    { name: 'Task List', icon: ListIcon },
    { name: 'Task Calendar', icon: CalendarIcon },
    { name: 'Study Groups', icon: UsersRound },
    { name: 'Logout', icon: LogOut },
  ];
  return (
    <ul className="menu w-full grow">
      {/* List item */}
      {sideBarItems.map((item) => (
        <li key={item.name}>
          <button
            className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive(item.name) ? 'bg-primary text-white' : ''}`}
            onClick={() => handleItemClick(item.name)}
            data-tip={item.name}
          >
            <item.icon
              className={`my-1.5 inline-block size-4 ${getIconColor(item.name)}`}
            />
            <span
              className={`is-drawer-close:hidden whitespace-nowrap truncate${getTextColor(item.name)}`}
            >
              {item.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
