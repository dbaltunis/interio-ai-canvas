import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DemoDataProvider } from './DemoDataProvider';
import { DemoRouter } from './DemoRouter';
import { DemoHeader } from './DemoHeader';
import './demo-styles.css';

export const DemoApp = () => {
  return (
    <div className="demo-container">
      <BrowserRouter>
        <DemoDataProvider>
          <div className="min-h-screen bg-background">
            <DemoHeader />
            <main className="flex-1">
              <DemoRouter />
            </main>
          </div>
        </DemoDataProvider>
      </BrowserRouter>
    </div>
  );
};

export default DemoApp;