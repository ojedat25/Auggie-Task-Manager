import { SquareChevronLeft, SquareChevronRight } from 'lucide-react';

export interface NavBarProps {
  title: string;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

export const NavBar = ({
  title,
  drawerOpen,
  onDrawerOpenChange,
}: NavBarProps) => {
  const Icon = drawerOpen ? SquareChevronLeft : SquareChevronRight;
  return (
    <nav className="navbar w-full bg-base-300">
      <button
        type="button"
        aria-label={drawerOpen ? 'Close sidebar' : 'Open sidebar'}
        className="btn btn-square btn-ghost"
        onClick={() => onDrawerOpenChange(!drawerOpen)}
      >
        <Icon className="my-1.5 inline-block size-4" aria-hidden />
      </button>
      <div className="px-4">{title}</div>
    </nav>
  );
};
