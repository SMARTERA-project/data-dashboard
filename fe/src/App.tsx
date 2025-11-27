import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Analysis from '@/pages/Analysis';
import NotFound from '@/pages/NotFound';
import MainLayout from '@/layouts/MainLayout';
import Help from '@pages/Help';

const App: React.FC = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />

      <Route path="dashboard">
        <Route index element={<Dashboard />} />
        <Route path=":regionId" element={<Dashboard />} />
      </Route>

      <Route path="analysis">
        <Route index element={<Analysis />} />
        <Route path=":regionId" element={<Analysis />} />
      </Route>

      <Route path="help" element={<Help />} />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  </Routes>
);

export default App;
