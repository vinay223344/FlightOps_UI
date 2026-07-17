import { NavLink } from 'react-router-dom';
import type { NavItem } from '../constants/navigation';

interface SidebarProps {
  items: NavItem[];
  onNavigate?: () => void;
}

/** Left navigation column. Items come from ROLE_NAV for the active role. */
export default function Sidebar({ items, onNavigate }: SidebarProps) {
  return (
    <aside className="fo-sidebar py-3">
      <nav className="nav flex-column">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="nav-link"
              onClick={onNavigate}
            >
              <Icon size={18} stroke={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
