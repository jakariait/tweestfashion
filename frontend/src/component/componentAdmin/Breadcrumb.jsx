import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Menu,
  ExternalLink,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SidebarMenu from './SidebarMenu.jsx';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { useNavigate } from 'react-router-dom';

import useBreadcrumbStore from '../../store/BreadcrumbStore.js';

const Breadcrumb = () => {
  const { pageDetails, title } = useBreadcrumbStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { admin, logout, initialize } = useAuthAdminStore();
  const navigate = useNavigate();

  const handleClickOutside = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      !hamburgerRef.current?.contains(event.target)
    ) {
      setIsMenuOpen(false);
    }
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !buttonRef.current?.contains(event.target)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen || isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isDropdownOpen]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = admin?.name
    ? admin.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A';

  return (
    <>
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-muted-foreground/10 flex items-center justify-between gap-4 px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            ref={hamburgerRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-1.5 -ml-1 rounded-md hover:bg-muted transition-colors"
          >
            <Menu className="size-5" />
          </button>

          <div className="min-w-0">
            {pageDetails && (
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                <span className="font-medium tracking-wider uppercase">
                  Pages
                </span>
                <ChevronRight className="size-3" />
                <span className="truncate">{pageDetails}</span>
              </nav>
            )}
            {title && (
              <h1 className="text-sm lg:text-base font-semibold text-foreground truncate">
                {title}
              </h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 mr-1.5" />
              Visit Website
            </a>
          </Button>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-muted transition-colors"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                  {admin?.name || 'Admin'}
                </span>
                <ChevronDown
                  className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg p-1 z-50"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium truncate">
                    {admin?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {admin?.email || ''}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <LogOut className="size-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          ref={menuRef}
          className={`relative h-full w-64 bg-white shadow-xl transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto bg-primary text-primary-foreground">
            <SidebarMenu />
          </div>
        </div>
      </div>
    </>
  );
};

export default Breadcrumb;
