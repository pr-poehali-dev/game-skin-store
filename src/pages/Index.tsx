import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { AuthDialog } from '@/components/AuthDialog';
import { authService, type User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Skin {
  id: number;
  name: string;
  game: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  popular: boolean;
}

const mockSkins: Skin[] = [
  { id: 1, name: 'Dragon Lore AWP', game: 'CS:GO', price: 2500, rarity: 'legendary', image: '🔫', popular: true },
  { id: 2, name: 'Butterfly Knife Fade', game: 'CS:GO', price: 1800, rarity: 'legendary', image: '🔪', popular: true },
  { id: 3, name: 'AK-47 Fire Serpent', game: 'CS:GO', price: 950, rarity: 'epic', image: '🔫', popular: true },
  { id: 4, name: 'Reaver Vandal', game: 'Valorant', price: 45, rarity: 'epic', image: '⚔️', popular: false },
  { id: 5, name: 'Elderflame Operator', game: 'Valorant', price: 55, rarity: 'legendary', image: '🐉', popular: true },
  { id: 6, name: 'Arcane Jinx', game: 'League of Legends', price: 25, rarity: 'rare', image: '✨', popular: false },
  { id: 7, name: 'M4A4 Howl', game: 'CS:GO', price: 3200, rarity: 'legendary', image: '🔫', popular: true },
  { id: 8, name: 'Karambit Tiger Tooth', game: 'CS:GO', price: 1200, rarity: 'legendary', image: '🔪', popular: true },
  { id: 9, name: 'Prime Vandal', game: 'Valorant', price: 40, rarity: 'epic', image: '⚡', popular: true },
  { id: 10, name: 'Spirit Blossom Ahri', game: 'League of Legends', price: 30, rarity: 'epic', image: '🌸', popular: false },
  { id: 11, name: 'Desert Eagle Blaze', game: 'CS:GO', price: 450, rarity: 'rare', image: '🔫', popular: false },
  { id: 12, name: 'Glock Fade', game: 'CS:GO', price: 380, rarity: 'rare', image: '🔫', popular: false },
];

function Index() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [cart, setCart] = useState<Skin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [user, setUser] = useState<User | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const { token, user: savedUser } = authService.getSession();
    if (token && savedUser) {
      authService.verify(token).then((result) => {
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          authService.clearSession();
        }
      });
    }
  }, []);

  const handleLogout = () => {
    authService.clearSession();
    setUser(null);
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!',
    });
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500/20 text-gray-300 border-gray-500',
      rare: 'bg-blue-500/20 text-blue-300 border-blue-500',
      epic: 'bg-purple-500/20 text-purple-300 border-purple-500',
      legendary: 'bg-accent/20 text-accent border-accent'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const addToCart = (skin: Skin) => {
    setCart([...cart, skin]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const filteredSkins = mockSkins
    .filter(skin => {
      const matchesSearch = skin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = gameFilter === 'all' || skin.game === gameFilter;
      const matchesRarity = rarityFilter === 'all' || skin.rarity === rarityFilter;
      return matchesSearch && matchesGame && matchesRarity;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.popular ? 1 : -1;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center glow-cyan">
                <Icon name="Gamepad2" className="w-6 h-6 text-background" />
              </div>
              <h1 className="text-3xl font-rajdhani font-bold text-glow-cyan">SKIN STORE</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-rajdhani font-semibold text-primary">{user.username}</p>
                    <p className="text-sm text-muted-foreground">${user.balance}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLogout}
                    className="border-border/50 hover:border-destructive hover:text-destructive"
                  >
                    <Icon name="LogOut" className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setAuthDialogOpen(true)}
                  className="border-neon-cyan/50 hover:border-neon-cyan hover:glow-cyan"
                >
                  <Icon name="User" className="w-4 h-4 mr-2" />
                  Войти
                </Button>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative border-neon-cyan/50 hover:border-neon-cyan hover:glow-cyan transition-all">
                    <Icon name="ShoppingCart" className="w-5 h-5" />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-accent glow-pink">{cart.length}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-effect border-l border-border/50">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-rajdhani text-glow-cyan">Корзина</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Корзина пуста</p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <Card key={item.id} className="p-4 glass-effect border-border/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl">{item.image}</div>
                                <div>
                                  <h4 className="font-semibold">{item.name}</h4>
                                  <p className="text-sm text-primary">${item.price}</p>
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeFromCart(item.id)}
                                className="hover:bg-destructive/20 hover:text-destructive"
                              >
                                <Icon name="Trash2" className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                        <div className="pt-4 border-t border-border/50">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-rajdhani font-semibold">Итого:</span>
                            <span className="text-2xl font-rajdhani font-bold text-primary text-glow-cyan">
                              ${getTotalPrice()}
                            </span>
                          </div>
                          <Button className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 glow-cyan">
                            <Icon name="CreditCard" className="w-4 h-4 mr-2" />
                            Оформить заказ
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 glass-effect border border-border/50">
            <TabsTrigger value="catalog" className="font-rajdhani data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-primary">
              <Icon name="Grid3x3" className="w-4 h-4 mr-2" />
              Каталог
            </TabsTrigger>
            <TabsTrigger value="profile" className="font-rajdhani data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-primary">
              <Icon name="User" className="w-4 h-4 mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="about" className="font-rajdhani data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-primary">
              <Icon name="Info" className="w-4 h-4 mr-2" />
              О нас
            </TabsTrigger>
            <TabsTrigger value="stats" className="font-rajdhani data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-primary">
              <Icon name="TrendingUp" className="w-4 h-4 mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6 animate-slide-in">
            <div className="glass-effect p-6 rounded-lg border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">Поиск</label>
                  <Input
                    placeholder="Найти скин..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-effect border-border/50 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">Игра</label>
                  <Select value={gameFilter} onValueChange={setGameFilter}>
                    <SelectTrigger className="glass-effect border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все игры</SelectItem>
                      <SelectItem value="CS:GO">CS:GO</SelectItem>
                      <SelectItem value="Valorant">Valorant</SelectItem>
                      <SelectItem value="League of Legends">League of Legends</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">Редкость</label>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger className="glass-effect border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Сортировка:</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    onClick={() => setSortBy('popular')}
                    className={sortBy === 'popular' ? 'bg-primary/20 border-primary' : ''}
                  >
                    <Icon name="TrendingUp" className="w-4 h-4 mr-1" />
                    Популярные
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'price-low' ? 'default' : 'outline'}
                    onClick={() => setSortBy('price-low')}
                    className={sortBy === 'price-low' ? 'bg-primary/20 border-primary' : ''}
                  >
                    <Icon name="ArrowUp" className="w-4 h-4 mr-1" />
                    Дешевле
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'price-high' ? 'default' : 'outline'}
                    onClick={() => setSortBy('price-high')}
                    className={sortBy === 'price-high' ? 'bg-primary/20 border-primary' : ''}
                  >
                    <Icon name="ArrowDown" className="w-4 h-4 mr-1" />
                    Дороже
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSkins.map((skin) => (
                <Card
                  key={skin.id}
                  className="group glass-effect border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:glow-cyan"
                >
                  <div className="p-6">
                    <div className="relative">
                      <div className="text-7xl mb-4 text-center animate-float">{skin.image}</div>
                      {skin.popular && (
                        <Badge className="absolute top-0 right-0 bg-accent/90 glow-pink animate-glow-pulse">
                          <Icon name="Flame" className="w-3 h-3 mr-1" />
                          ТОП
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-rajdhani font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {skin.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{skin.game}</p>
                      </div>

                      <Badge className={`${getRarityColor(skin.rarity)} border`}>
                        {skin.rarity.toUpperCase()}
                      </Badge>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-rajdhani font-bold text-primary text-glow-cyan">
                          ${skin.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(skin)}
                          className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90"
                        >
                          <Icon name="ShoppingCart" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredSkins.length === 0 && (
              <Card className="glass-effect p-12 text-center border-border/50">
                <Icon name="SearchX" className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-rajdhani font-semibold mb-2">Скины не найдены</h3>
                <p className="text-muted-foreground">Попробуйте изменить фильтры поиска</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="animate-slide-in">
            {!user ? (
              <div className="max-w-2xl mx-auto">
                <Card className="glass-effect p-12 text-center border border-border/50">
                  <Icon name="UserX" className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-rajdhani font-bold mb-2">Войдите в аккаунт</h3>
                  <p className="text-muted-foreground mb-6">Чтобы просматривать профиль и покупки</p>
                  <Button
                    onClick={() => setAuthDialogOpen(true)}
                    className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 glow-cyan"
                  >
                    <Icon name="LogIn" className="w-4 h-4 mr-2" />
                    Войти
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                <Card className="glass-effect p-8 border border-border/50">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl glow-cyan">
                      👤
                    </div>
                    <div>
                      <h2 className="text-3xl font-rajdhani font-bold mb-2 text-glow-purple">{user.username}</h2>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card className="glass-effect p-4 text-center border-neon-cyan/30">
                      <div className="text-3xl font-rajdhani font-bold text-primary text-glow-cyan">${user.balance}</div>
                      <div className="text-sm text-muted-foreground mt-1">Баланс</div>
                    </Card>
                    <Card className="glass-effect p-4 text-center border-neon-purple/30">
                      <div className="text-3xl font-rajdhani font-bold text-secondary text-glow-purple">{cart.length}</div>
                      <div className="text-sm text-muted-foreground mt-1">В корзине</div>
                    </Card>
                    <Card className="glass-effect p-4 text-center border-accent/30">
                      <div className="text-3xl font-rajdhani font-bold text-accent glow-pink">Gold</div>
                      <div className="text-sm text-muted-foreground mt-1">Статус</div>
                    </Card>
                  </div>
                </Card>

                <Card className="glass-effect p-6 border border-border/50">
                  <h3 className="text-xl font-rajdhani font-bold mb-4 flex items-center gap-2">
                    <Icon name="History" className="w-5 h-5 text-primary" />
                    Последние покупки
                  </h3>
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="ShoppingBag" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Покупок пока нет</p>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="animate-slide-in">
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="glass-effect p-8 border border-border/50">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-rajdhani font-bold mb-4 text-glow-cyan">О SKIN STORE</h2>
                  <p className="text-lg text-muted-foreground">
                    Крупнейший маркетплейс игровых скинов в СНГ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 glass-effect rounded-lg border border-neon-cyan/30">
                    <div className="text-5xl mb-3">⚡</div>
                    <h3 className="font-rajdhani font-bold text-xl mb-2 text-primary">Мгновенная доставка</h3>
                    <p className="text-sm text-muted-foreground">Скины приходят на аккаунт за секунды</p>
                  </div>
                  <div className="text-center p-6 glass-effect rounded-lg border border-neon-purple/30">
                    <div className="text-5xl mb-3">🛡️</div>
                    <h3 className="font-rajdhani font-bold text-xl mb-2 text-secondary">100% безопасность</h3>
                    <p className="text-sm text-muted-foreground">Гарантия подлинности всех предметов</p>
                  </div>
                  <div className="text-center p-6 glass-effect rounded-lg border border-accent/30">
                    <div className="text-5xl mb-3">💎</div>
                    <h3 className="font-rajdhani font-bold text-xl mb-2 text-accent">Эксклюзивы</h3>
                    <p className="text-sm text-muted-foreground">Редкие скины для коллекционеров</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-rajdhani font-bold">Почему выбирают нас?</h3>
                  <ul className="space-y-3">
                    {[
                      'Более 50,000 довольных клиентов',
                      'Работаем с 2020 года',
                      'Поддержка 24/7 на русском языке',
                      'Гибкая система скидок и бонусов',
                      'Партнерская программа для стримеров'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Icon name="CheckCircle2" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card className="glass-effect p-6 border border-border/50">
                <h3 className="text-xl font-rajdhani font-bold mb-4">Связаться с нами</h3>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-neon-cyan/20 border border-neon-cyan hover:bg-neon-cyan/30">
                    <Icon name="Mail" className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button className="bg-neon-purple/20 border border-neon-purple hover:bg-neon-purple/30">
                    <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                    Telegram
                  </Button>
                  <Button className="bg-accent/20 border border-accent hover:bg-accent/30">
                    <Icon name="Phone" className="w-4 h-4 mr-2" />
                    Поддержка
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="animate-slide-in">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="glass-effect p-8 border border-border/50">
                <h2 className="text-3xl font-rajdhani font-bold mb-6 text-glow-cyan">Статистика платформы</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <Card className="glass-effect p-4 text-center border-neon-cyan/30">
                    <div className="text-4xl mb-2">🎮</div>
                    <div className="text-2xl font-rajdhani font-bold text-primary">50K+</div>
                    <div className="text-sm text-muted-foreground">Пользователей</div>
                  </Card>
                  <Card className="glass-effect p-4 text-center border-neon-purple/30">
                    <div className="text-4xl mb-2">💰</div>
                    <div className="text-2xl font-rajdhani font-bold text-secondary">$2.5M</div>
                    <div className="text-sm text-muted-foreground">Оборот</div>
                  </Card>
                  <Card className="glass-effect p-4 text-center border-accent/30">
                    <div className="text-4xl mb-2">🔥</div>
                    <div className="text-2xl font-rajdhani font-bold text-accent">120K</div>
                    <div className="text-sm text-muted-foreground">Продаж</div>
                  </Card>
                  <Card className="glass-effect p-4 text-center border-primary/30">
                    <div className="text-4xl mb-2">⭐</div>
                    <div className="text-2xl font-rajdhani font-bold text-primary">4.9/5</div>
                    <div className="text-sm text-muted-foreground">Рейтинг</div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-rajdhani font-bold mb-4">Популярные игры</h3>
                  {[
                    { game: 'CS:GO', percentage: 65, color: 'bg-neon-cyan' },
                    { game: 'Valorant', percentage: 25, color: 'bg-neon-purple' },
                    { game: 'League of Legends', percentage: 10, color: 'bg-accent' }
                  ].map((item) => (
                    <div key={item.game}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{item.game}</span>
                        <span className="text-muted-foreground">{item.percentage}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-effect p-6 border border-border/50">
                <h3 className="text-xl font-rajdhani font-bold mb-4">Топ продаж недели</h3>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Dragon Lore AWP', sales: 234 },
                    { rank: 2, name: 'Butterfly Knife Fade', sales: 189 },
                    { rank: 3, name: 'AK-47 Fire Serpent', sales: 156 },
                    { rank: 4, name: 'Elderflame Operator', sales: 145 },
                    { rank: 5, name: 'Karambit Tiger Tooth', sales: 132 }
                  ].map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-center justify-between p-3 glass-effect rounded-lg border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-rajdhani font-bold ${
                          item.rank === 1 ? 'bg-accent text-background glow-pink' :
                          item.rank === 2 ? 'bg-primary text-background' :
                          item.rank === 3 ? 'bg-secondary text-background' :
                          'bg-muted text-foreground'
                        }`}>
                          {item.rank}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{item.sales} продаж</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/50 mt-16 py-8 glass-effect">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-rajdhani">© 2024 SKIN STORE. Все права защищены.</p>
          <p className="text-sm mt-2">Киберспортивный маркетплейс игровых предметов</p>
        </div>
      </footer>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onAuthSuccess={setUser}
      />
    </div>
  );
}

export default Index;