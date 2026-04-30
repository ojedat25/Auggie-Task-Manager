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
    <nav
      className={
        'navbar fixed top-0 z-30 bg-base-300 shadow-sm border-b border-base-200 transition-[left,width] duration-150 ease-out ' +
        'left-0 right-0 w-full ' +
        (drawerOpen
          ? 'lg:left-64 lg:w-[calc(100%-16rem)]'
          : 'lg:left-14 lg:w-[calc(100%-3.5rem)]')
      }
    >
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
