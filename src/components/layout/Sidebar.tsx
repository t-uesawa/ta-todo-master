import {
  Home,
  CheckSquare,
  FolderPlus,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'ダッシュボード', icon: Home },
  { id: 'tasks', label: 'タスク', icon: CheckSquare },
  { id: 'projects', label: 'プロジェクト', icon: FolderPlus },
  { id: 'masters', label: 'マスタ', icon: Settings },
  { id: 'test', label: 'テスト', icon: Settings },
];

export function AppSidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <Sidebar className='fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        onPageChange(item.id);
                      }}
                      isActive={currentPage === item.id}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}