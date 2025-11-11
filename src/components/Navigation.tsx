import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Home, 
  Calendar, 
  Focus, 
  Brain, 
  Settings,
  LogOut,
  Menu,
  X,
  Cloud,
  Smartphone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DataManager } from '../utils/DataManager';
import aquariumLogo from 'figma:asset/2fc08412acabe9b8a61790ab3bc5224024cff33a.png';

export type NavigationScreen = 'dashboard' | 'planner' | 'focus' | 'meditation' | 'settings';

interface NavigationProps {
  currentScreen: NavigationScreen;
  onScreenChange: (screen: NavigationScreen) => void;
  onLogout: () => void;
  user: string;
  tasksCount: number;
}

export function Navigation({ currentScreen, onScreenChange, onLogout, user, tasksCount }: NavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [syncMode, setSyncMode] = useState<'cloud-sync'>('cloud-sync');
  
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    const updateSyncMode = () => {
      const status = dataManager.getSyncStatus();
      setSyncMode(status.mode);
    };
    
    updateSyncMode();
    const interval = setInterval(updateSyncMode, 5000);
    
    return () => clearInterval(interval);
  }, [dataManager]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'planner', label: 'Planner', icon: Calendar, color: 'text-cyan-600' },
    { id: 'focus', label: 'Focus', icon: Focus, color: 'text-purple-600' },
    { id: 'meditation', label: 'Meditation', icon: Brain, color: 'text-green-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
  ] as const;

  const NavButton = ({ item, isActive }: { item: typeof navItems[0], isActive: boolean }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={() => {
          onScreenChange(item.id as NavigationScreen);
          setShowMobileMenu(false);
        }}
        className={`
          relative overflow-hidden transition-all duration-300 float-3d
          ${isActive 
            ? 'glass-morandi text-blue-800 float-3d-active morandi-blue' 
            : 'text-blue-700 hover:glass-morandi hover:text-blue-800 bg-white/10'
          }
          rounded-2xl px-4 md:px-6 py-2 md:py-3 border border-white/20
        `}
      >
        <div
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${isActive ? 'text-blue-600' : item.color}`} />
        </div>
        <span className="ml-2 hidden sm:inline">{item.label}</span>
        
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent rounded-2xl"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}
      </Button>
    </motion.div>
  );

  return (
    <>
      {/* Desktop/Web Navigation - Fixed Top Bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-b border-white/30 p-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              className="w-10 h-10 rounded-full flex items-center justify-center float-3d overflow-hidden"
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <img 
                src={aquariumLogo} 
                alt="Aquarium Serenity" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div>
              <h1 className="text-xl font-medium text-blue-800">Aquarium Serenity</h1>
              <p className="text-sm text-blue-600">Welcome back, {user.split('@')[0]}</p>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavButton 
                key={item.id} 
                item={item} 
                isActive={currentScreen === item.id} 
              />
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="text-sm text-blue-700 glass-morandi px-3 py-1 rounded-full float-3d"
              whileHover={{ scale: 1.05 }}
            >
              {tasksCount} active tasks
            </motion.div>
            
            {/* Storage Mode Indicator */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xs glass-morandi px-2 py-1 rounded-full float-3d"
            >
              <Badge 
                variant="outline" 
                className="border-white/40 text-blue-700 bg-blue-50/50"
              >
                <Cloud className="h-3 w-3 mr-1" />
                Cloud
              </Badge>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="rounded-full glass-morandi hover:morandi-coral hover:text-red-600 border border-white/30 float-3d"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Fixed Top Bar with Hamburger */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-b border-white/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src={aquariumLogo} 
                alt="Aquarium Serenity" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-medium text-blue-800">Aquarium Serenity</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-blue-600">{tasksCount} tasks</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs border-white/40 ${
                    syncMode === 'local-only' 
                      ? 'text-green-700 bg-green-50/50' 
                      : 'text-blue-700 bg-blue-50/50'
                  }`}
                >
                  {syncMode === 'local-only' ? (
                    <>
                      <Smartphone className="h-2 w-2 mr-1" />
                      Local
                    </>
                  ) : (
                    <>
                      <Cloud className="h-2 w-2 mr-1" />
                      Cloud
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="rounded-full bg-white/20 hover:bg-white/30 border border-white/30"
          >
            {showMobileMenu ? (
              <X className="h-5 w-5 text-blue-700" />
            ) : (
              <Menu className="h-5 w-5 text-blue-700" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-4 max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavButton 
                  key={item.id} 
                  item={item} 
                  isActive={currentScreen === item.id} 
                />
              ))}
              <div className="border-t border-blue-100 pt-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-t border-white/30 pb-safe">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onScreenChange(item.id as NavigationScreen)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300
                ${currentScreen === item.id 
                  ? 'bg-blue-100 text-blue-700 scale-105' 
                  : 'text-blue-600 hover:bg-blue-50'
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${currentScreen === item.id ? 'text-blue-600' : item.color}`} />
              <span className="text-xs">{item.label}</span>
              
              {currentScreen === item.id && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-blue-100 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}