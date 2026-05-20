import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const Sidebar = () => {
  const { user } = useAppSelector((state) => state.auth);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white shadow'
        : 'text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800'
    }`;

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 z-10 hidden md:block">
      <nav className="space-y-2">
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/leads/new" className={linkClass}>
          Add Lead
        </NavLink>
        {user?.role === 'admin' && (
          <p className="px-4 pt-4 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Admin access
          </p>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
