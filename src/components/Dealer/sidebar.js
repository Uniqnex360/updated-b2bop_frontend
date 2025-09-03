import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faColumns,
  faBox,
  faReceipt,
  faCog,
  faSignOutAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Logout from '../Login/Logout';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection = (() => {
    const path = location.pathname;
    if (path.includes('/dealer/products')) return 'products';
    if (path.includes('/dealer/orders')) return 'orders';
    if (path.includes('/dealer/settings')) return 'settings';
    if (path === '/dealer') return 'dashboard';
    return '';
  })();

  return (
    <div
      className={`
        fixed top-0 left-0 h-full bg-white shadow-lg flex flex-col justify-between z-50
        transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-[170px] min-w-[170px]
        md:translate-x-0
      `}
      style={{
        minHeight: '100vh',
      }}
    >
      {/* Close Button (visible on mobile only) */}
      <div>
        <div className="md:hidden text-right p-2">
          <FontAwesomeIcon icon={faTimes} className="icon" onClick={toggleSidebar} style={{ cursor: 'pointer' }} />
        </div>

        {/* Dashboard Title */}
        <div className="px-4 pt-2 pb-1">
          <span className="font-bold text-base text-gray-800 tracking-wide">Dashboard</span>
        </div>

        {/* Menu Items */}
        <ul className="topMenu" style={{ listStyle: 'none', padding: '0 10px', margin: '20px 0px 0px 0px' }}>
          <li
            onClick={() => navigate('/dealer')}
            className={`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 5px',
              cursor: 'pointer',
              color: activeSection === 'dashboard' ? '#007bff' : '#000',
            }}
          >
            <FontAwesomeIcon icon={faColumns} className="icon" style={{ marginRight: '10px' }} />
            Dashboard
          </li>

          <li
            onClick={() => navigate('/dealer/products')}
            className={`menu-item ${activeSection === 'products' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 5px',
              cursor: 'pointer',
              color: activeSection === 'products' ? '#007bff' : '#000',
              backgroundColor: activeSection === 'products' ? '#f5f7fa' : 'transparent',
              borderRadius: '4px',
            }}
          >
            <FontAwesomeIcon icon={faBox} className="icon" style={{ marginRight: '10px' }} />
            Products
          </li>

          <li
            onClick={() => navigate('/dealer/orders')}
            className={`menu-item ${activeSection === 'orders' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 5px',
              cursor: 'pointer',
              color: activeSection === 'orders' ? '#007bff' : '#000',
            }}
          >
            <FontAwesomeIcon icon={faReceipt} className="icon" style={{ marginRight: '10px' }} />
            Orders
          </li>
          <li
            onClick={() => navigate('/dealer/settings')}
            className={`menu-item ${activeSection === 'settings' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 5px',
              cursor: 'pointer',
              color: activeSection === 'settings' ? '#007bff' : '#000',
            }}
          >
            <FontAwesomeIcon icon={faCog} className="icon" style={{ marginRight: '10px' }} />
            Settings
          </li>
        </ul>
      </div>

      {/* Logout Button at the Bottom */}
      <div style={{ padding: '10px', cursor: 'pointer' }}>
        <Logout>
          <FontAwesomeIcon icon={faSignOutAlt} className="icon" style={{ marginRight: '10px' }} />
          Logout
        </Logout>
      </div>
    </div>
  );
};

export default Sidebar;