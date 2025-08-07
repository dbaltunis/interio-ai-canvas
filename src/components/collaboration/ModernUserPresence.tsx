import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { Users, MessageCircle, Zap, Circle } from 'lucide-react';

interface ModernUserPresenceProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ModernUserPresence = ({ isOpen, onToggle }: ModernUserPresenceProps) => {
  const { activeUsers = [] } = useUserPresence();
  const { openConversation } = useDirectMessages();

  const onlineUsers = activeUsers.filter(u => u.status === 'online');
  const totalUsers = activeUsers.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'from-green-400 to-emerald-500';
      case 'away': return 'from-yellow-400 to-orange-500';
      case 'busy': return 'from-red-400 to-pink-500';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onToggle}
          className="relative h-16 w-16 rounded-full glass-morphism border-0 shadow-2xl overflow-hidden group"
          variant="ghost"
        >
          {/* Animated background orbs */}
          <div className="ai-orb absolute -top-2 -right-2 w-8 h-8" />
          <div className="ai-orb absolute -bottom-1 -left-1 w-6 h-6" style={{ animationDelay: '2s' }} />
          
          {/* Icon with gradient */}
          <div className="relative z-10 flex items-center justify-center">
            <Users className="h-7 w-7 text-white drop-shadow-lg" />
            {onlineUsers.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white presence-pulse"
              >
                {onlineUsers.length}
              </motion.div>
            )}
          </div>
          
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/30 group-hover:from-primary/30 group-hover:to-accent/40 transition-all duration-300" />
        </Button>
      </motion.div>

      {/* Sliding Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={onToggle}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-96 z-50 glass-morphism shadow-2xl overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 ai-gradient-bg" />
              <div className="ai-orb absolute top-20 -right-10 w-24 h-24" />
              <div className="ai-orb absolute bottom-32 -left-6 w-16 h-16" style={{ animationDelay: '3s' }} />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-400" />
                        Team Pulse
                      </h2>
                      <p className="text-white/70 text-sm">
                        {onlineUsers.length} of {totalUsers} online
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggle}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {onlineUsers.map((user, index) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      <div className="glass-morphism rounded-xl p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                           onClick={() => openConversation(user.user_id)}>
                        
                        {/* Status indicator gradient line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getStatusColor(user.status)} rounded-l-xl`} />
                        
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-white/20">
                              <AvatarImage src={user.user_profile?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                                {user.user_profile?.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Animated status dot */}
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-r ${getStatusColor(user.status)} rounded-full border-2 border-white/30`}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-white truncate">
                                {user.user_profile?.display_name}
                              </p>
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-white/10 text-white/80 border-white/20"
                              >
                                {user.user_profile?.role}
                              </Badge>
                            </div>
                            
                            {user.current_activity && (
                              <p className="text-sm text-white/60 truncate">
                                🎯 {user.current_activity}
                              </p>
                            )}
                          </div>
                          
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 p-0"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Away/Offline Users */}
                  {activeUsers.filter(u => u.status !== 'online').length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: onlineUsers.length * 0.1 + 0.3 }}
                    >
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-white/50 text-sm mb-3 font-medium">Away</p>
                        <div className="space-y-2">
                          {activeUsers.filter(u => u.status !== 'online').map((user) => (
                            <div key={user.user_id} className="flex items-center gap-3 p-2 rounded-lg opacity-60">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.user_profile?.avatar_url} />
                                <AvatarFallback className="bg-gray-400 text-white text-xs">
                                  {user.user_profile?.display_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/70 truncate">
                                  {user.user_profile?.display_name}
                                </p>
                              </div>
                              <Circle className={`h-3 w-3 fill-current text-gray-400`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};