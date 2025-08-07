import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { MessageCircle, Send, Sparkles, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ModernMessageCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModernMessageCenter = ({ isOpen, onClose }: ModernMessageCenterProps) => {
  const { conversations = [], messages = [], activeConversation, sendMessage, sendingMessage } = useDirectMessages();
  const { activeUsers = [] } = useUserPresence();
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;
    sendMessage(activeConversation, messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeUserData = activeConversation ? 
    activeUsers.find(u => u.user_id === activeConversation) ||
    conversations.find(c => c.user_id === activeConversation) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Message Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 lg:inset-8 z-50 glass-morphism rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 ai-gradient-bg" />
            <div className="ai-orb absolute top-10 right-20 w-32 h-32" />
            <div className="ai-orb absolute bottom-20 left-10 w-20 h-20" style={{ animationDelay: '2s' }} />
            <div className="ai-orb absolute top-1/2 left-1/3 w-16 h-16" style={{ animationDelay: '4s' }} />
            
            {/* Content */}
            <div className="relative z-10 h-full flex">
              {/* Conversations Sidebar */}
              <div className="w-1/3 border-r border-white/10 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Sparkles className="h-7 w-7 text-yellow-400" />
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0"
                        >
                          <Zap className="h-7 w-7 text-blue-400 opacity-60" />
                        </motion.div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Messages</h2>
                        <p className="text-white/60 text-sm">{conversations.length} conversations</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {conversations.map((conversation, index) => {
                    const isActive = activeConversation === conversation.user_id;
                    const user = conversation.user_profile;
                    
                    return (
                      <motion.div
                        key={conversation.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group cursor-pointer transition-all duration-300 ${
                          isActive ? 'scale-105' : 'hover:scale-102'
                        }`}
                      >
                        <div className={`glass-morphism rounded-xl p-4 border transition-all duration-300 ${
                          isActive 
                            ? 'border-white/30 bg-white/20 shadow-lg' 
                            : 'border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12 ring-2 ring-white/20">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                                  {user.display_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              {/* Status indicator */}
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white/30" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-white truncate">
                                  {user.display_name}
                                </p>
                                {conversation.unread_count > 0 && (
                                  <Badge className="bg-gradient-to-r from-red-400 to-pink-500 text-white border-0 text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                              
                              {conversation.last_message && (
                                <p className="text-sm text-white/60 truncate">
                                  {conversation.last_message.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {conversations.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <MessageCircle className="h-16 w-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">No conversations yet</p>
                      <p className="text-white/40 text-sm">Start chatting with your team</p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {activeConversation && activeUserData ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-white/20">
                          <AvatarImage src={activeUserData.user_profile?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {activeUserData.user_profile?.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {activeUserData.user_profile?.display_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                            <p className="text-white/60 text-sm">Online</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center h-full text-center"
                        >
                          <div className="relative mb-6">
                            <MessageCircle className="h-20 w-20 text-white/20" />
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 border-4 border-white/10 border-t-white/30 rounded-full"
                            />
                          </div>
                          <p className="text-white/60 text-lg mb-2">Start the conversation!</p>
                          <p className="text-white/40">Send a message to begin chatting</p>
                        </motion.div>
                      ) : (
                        messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex ${message.sender_id === activeConversation ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`max-w-[70%] p-4 rounded-2xl ${
                              message.sender_id === activeConversation
                                ? 'glass-morphism border border-white/20 text-white'
                                : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p className="text-xs mt-2 opacity-70">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-white/10">
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Type your message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={sendingMessage}
                            className="glass-morphism border-white/20 text-white placeholder:text-white/50 pr-12 rounded-xl h-12"
                          />
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageInput.trim() || sendingMessage}
                              size="sm"
                              className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 rounded-full h-8 w-8 p-0 shadow-lg"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Sparkles className="h-20 w-20 text-white/20 mx-auto mb-6" />
                      <p className="text-white/60 text-xl mb-2">Select a conversation</p>
                      <p className="text-white/40">Choose someone to start messaging</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};