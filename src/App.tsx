import { useEffect, useState } from 'react';
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
import { Toaster } from './components/ui/sonner';
import { useProject } from './hooks/data/use-project';
import { useMaster } from './hooks/data/use-master';
import { toast } from 'sonner';

function AppContent() {
  console.log('App.tsx レンダリング');
  const { loading: projectLoading, error: projectError, fetchProjects } = useProject();
  const { loading: masterLoading, error: masterError, fetchAllMasters } = useMaster();
  const { state } = useAuth();
  const { isMobile } = useResponsive();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProjects();
      await fetchAllMasters();
    }
    if (state.isAuthenticated) {
      fetchData();
    }
  }, [state]);

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectList />;
      case 'tasks':
        return <TaskList />;
      case 'masters':
        return <MasterManagement />;
      case 'test':
        return <Test />
      default:
        return <Dashboard />;
    }
  };

  if (projectLoading || masterLoading) {
    if (projectError) {
      toast.error(projectError);
    }

    if (masterError) {
      toast.error(masterError);
    }

    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      <Header isMobile={isMobile} />

      <div className="flex flex-1 min-h-0">
        <AppSidebar
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        <main className="flex-1 min-w-0 overflow-hidden">
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
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </SidebarProvider>
  );
}

export default App;