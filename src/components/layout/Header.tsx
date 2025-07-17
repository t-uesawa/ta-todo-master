import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarTrigger } from '../ui/sidebar';

interface HeaderProps {
  isMobile: boolean;
}

export function Header({ isMobile }: HeaderProps) {
  const { state, dispatch } = useAuth();
  // const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // const handleUserSwitch = (userUid: string) => {
  //   const user = state.users.find(u => u.uid === userUid);
  //   if (user) {
  //     dispatch({ type: 'SWITCH_USER', payload: user });
  //   }
  // };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          {isMobile && (
            <SidebarTrigger />
          )}
          <h1 className="text-xl font-bold text-gray-900">
            進捗管理
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {state.isAuthenticated && state.user && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {state.user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{state.user.name}</p>
                <p className="text-xs text-gray-500">{state.user.department}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}