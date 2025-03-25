import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';

// Create a client
const queryClient = new QueryClient();

// Basic component for our home page
const HomePage = () => {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="text-white">
            <h1 className="text-3xl font-bold">LinkOrbit</h1>
            <p className="text-indigo-100">Organize your content links</p>
          </div>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium">
            Sign In
          </button>
        </header>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Content Library</h2>
          <p className="text-gray-600 mb-8">
            Welcome to LinkOrbit! Your content links will appear here.
          </p>
          
          <div className="p-4 bg-indigo-50 rounded-md text-indigo-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Add your first link to get started with organization</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Not Found page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-xl text-gray-600">Page not found</p>
    </div>
  </div>
);

// App component with basic routing
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;