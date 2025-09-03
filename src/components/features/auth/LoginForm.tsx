import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export function LoginForm() {
  const { state, dispatch } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleLogin = () => {
    const user = state.users.find(u => u.uid === selectedUserId);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            プロジェクト進捗管理システム
          </CardTitle>
          <CardDescription>
            ログインするユーザーを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">ユーザー選択</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="ユーザーを選択..." />
              </SelectTrigger>
              <SelectContent>
                {state.users.map(user => {
                  return (
                    <SelectItem key={user.uid} value={user.uid}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{user.full_name}</span>
                        <span className="text-xs text-gray-500">
                          {user.parent_organization} - {user.child_organization}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!selectedUserId}
            className="w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            ログイン
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}