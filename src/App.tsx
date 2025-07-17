import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/layout/Header';
import { AppSidebar } from './components/layout/Sidebar';
import { LoginForm } from './components/features/auth/LoginForm';
import { Dashboard } from './components/features/dashboard/Dashboard';
import { TaskList } from './components/features/tasks/TaskList';
import { ProjectList } from './components/features/projects/ProjectList';
import { MasterManagement } from './components/features/masters/MasterManagement';
import { useResponsive } from './hooks/useResponsive';
import { Test } from './components/features/test/Test';

function AppContent() {
  const { state: authState } = useAuth();
  const { isMobile } = useResponsive();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  if (!authState.isAuthenticated) {
    return <LoginForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskList />;
      case 'projects':
        return <ProjectList />;
      case 'masters':
        return <MasterManagement />;
      case 'test':
        return <Test />
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      <Header isMobile={isMobile} />

      <div className="flex flex-1 min-h-0">
        <AppSidebar
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        <main className="flex-1 min-w-0 overflow-hidden md:p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SidebarProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </SidebarProvider>
  );
}

export default App;