import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DemoDashboard } from './pages/DemoDashboard';
import { DemoJobs } from './pages/DemoJobs';
import { DemoClients } from './pages/DemoClients';
import { DemoEmails } from './pages/DemoEmails';
import { DemoCalendar } from './pages/DemoCalendar';
import { DemoLibrary } from './pages/DemoLibrary';
import { DemoTeamHub } from './pages/DemoTeamHub';

export const DemoRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DemoDashboard />} />
      <Route path="/dashboard" element={<DemoDashboard />} />
      <Route path="/jobs" element={<DemoJobs />} />
      <Route path="/clients" element={<DemoClients />} />
      <Route path="/emails" element={<DemoEmails />} />
      <Route path="/calendar" element={<DemoCalendar />} />
      <Route path="/library" element={<DemoLibrary />} />
      <Route path="/team" element={<DemoTeamHub />} />
    </Routes>
  );
};