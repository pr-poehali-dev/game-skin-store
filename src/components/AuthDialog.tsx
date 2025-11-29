import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { authService, type User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: User) => void;
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await authService.login(loginData.username, loginData.password);
    
    setIsLoading(false);

    if (result.success && result.user && result.sessionToken) {
      authService.saveSession(result.sessionToken, result.user);
      onAuthSuccess(result.user);
      onOpenChange(false);
      toast({
        title: 'Вход выполнен!',
        description: `Добро пожаловать, ${result.user.username}!`,
      });
    } else {
      toast({
        title: 'Ошибка входа',
        description: result.error || 'Проверьте логин и пароль',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const result = await authService.register(
      registerData.username,
      registerData.email,
      registerData.password
    );

    setIsLoading(false);

    if (result.success && result.user && result.sessionToken) {
      authService.saveSession(result.sessionToken, result.user);
      onAuthSuccess(result.user);
      onOpenChange(false);
      toast({
        title: 'Регистрация успешна!',
        description: `Добро пожаловать, ${result.user.username}! Ваш стартовый баланс: $${result.user.balance}`,
      });
    } else {
      toast({
        title: 'Ошибка регистрации',
        description: result.error || 'Попробуйте другой логин или email',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-rajdhani text-glow-cyan">Вход в аккаунт</DialogTitle>
          <DialogDescription>
            Войдите или создайте новый аккаунт для покупки скинов
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-effect">
            <TabsTrigger value="login" className="font-rajdhani">Вход</TabsTrigger>
            <TabsTrigger value="register" className="font-rajdhani">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Логин</Label>
                <Input
                  id="login-username"
                  placeholder="Введите логин"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  className="glass-effect border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Введите пароль"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="glass-effect border-border/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 glow-cyan"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="w-4 h-4 mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Логин</Label>
                <Input
                  id="register-username"
                  placeholder="Выберите логин"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  className="glass-effect border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="glass-effect border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  minLength={6}
                  className="glass-effect border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Подтвердите пароль</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="Повторите пароль"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                  className="glass-effect border-border/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-purple to-accent hover:opacity-90 glow-purple"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="UserPlus" className="w-4 h-4 mr-2" />
                    Создать аккаунт
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
