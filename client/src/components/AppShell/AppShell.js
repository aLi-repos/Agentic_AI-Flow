import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationDrawer from './NotificationDrawer';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import api from '../../services/api';

const AppShell = ({ children, requireAuth = true }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (requireAuth) {
      api
        .get('/notifications?unreadOnly=true')
        .then((res) => {
          setUnreadCount(res.data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [requireAuth]);

  const content = (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-900 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenNotifications={() => setDrawerOpen(true)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto bg-surface-950/40 relative">
          {children}
        </main>
      </div>

      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );

  if (requireAuth) {
    return <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return content;
};

export default AppShell;
