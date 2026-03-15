import { SquareChevronLeft, SquareChevronRight } from 'lucide-react';
import { useState } from 'react';
export const NavBar = ({ title }: { title: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const Icon = isOpen ? SquareChevronLeft : SquareChevronRight;
  return (
    <nav className="navbar w-full bg-base-300">
      <label
        htmlFor="my-drawer-4"
        aria-label="open sidebar"
        className="btn btn-square btn-ghost"
        onClick={handleToggle}
      >
        {/* Sidebar toggle icon */}
        <Icon className="my-1.5 inline-block size-4" />
      </label>
      <div className="px-4">{title}</div>
    </nav>
  );
};
