import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Zap } from 'lucide-react';

interface NotificationData {
  id: string;
  type: 'message' | 'presence' | 'activity';
  title: string;
  message: string;
  avatar?: string;
  userName?: string;
  timestamp: Date;
}

interface AINotificationToastProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
  onAction?: (id: string) => void;
}

export const AINotificationToast = ({ notifications, onDismiss, onAction }: AINotificationToastProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageCircle;
      case 'presence': return Zap;
      default: return MessageCircle;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'message': return 'from-blue-400 to-primary';
      case 'presence': return 'from-green-400 to-emerald-500';
      case 'activity': return 'from-yellow-400 to-orange-500';
      default: return 'from-primary to-accent';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const Icon = getIcon(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                delay: index * 0.1
              }}
              className="relative overflow-hidden"
            >
              {/* Floating orbs */}
              <div className="ai-orb absolute -top-2 -right-2 w-6 h-6 opacity-40" />
              <div className="ai-orb absolute -bottom-1 -left-1 w-4 h-4 opacity-30" style={{ animationDelay: '1s' }} />
              
              <div className="glass-morphism rounded-2xl p-4 shadow-2xl border border-white/20 backdrop-blur-xl pointer-events-auto">
                {/* Gradient line indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getGradient(notification.type)} rounded-l-2xl`} />
                
                <div className="flex items-start gap-3">
                  {/* Avatar or Icon */}
                  <div className="relative flex-shrink-0">
                    {notification.avatar ? (
                      <Avatar className="h-10 w-10 ring-2 ring-white/20">
                        <AvatarImage src={notification.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                          {notification.userName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getGradient(notification.type)} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    {/* Animated ping indicator */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r ${getGradient(notification.type)} rounded-full opacity-80`}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white text-sm leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-white/70 text-xs mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-white/50 text-xs mt-2">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-1">
                        {onAction && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onAction(notification.id)}
                              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        )}
                        
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDismiss(notification.id)}
                            className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar for auto-dismiss */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${getGradient(notification.type)} rounded-bl-2xl`}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};