import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Users, Mail, MessageCircle, FileText, Send, Check } from "lucide-react";

interface SceneProps {
  progress: number;
}

const clients = [
  { name: "Sarah Johnson", email: "sarah@email.com", avatar: "SJ" },
  { name: "Mike Chen", email: "mike@company.co", avatar: "MC" },
  { name: "Emma Davis", email: "emma.d@mail.com", avatar: "ED" },
  { name: "James Wilson", email: "j.wilson@biz.io", avatar: "JW" },
];

export const CRMMessagingScene = ({ progress }: SceneProps) => {
  const listIn = phaseProgress(progress, 0, 0.35);
  const composeIn = phaseProgress(progress, 0.3, 0.55);
  const sendAnimation = phaseProgress(progress, 0.5, 0.75);
  const confirmIn = phaseProgress(progress, 0.7, 1);

  const scrollOffset = listIn * 40;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden flex">
      {/* Client list panel */}
      <motion.div
        className="w-1/2 border-r border-border/50 p-2 overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: listIn, x: 0 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Clients</span>
        </div>
        
        <motion.div 
          className="space-y-1.5"
          animate={{ y: -scrollOffset }}
        >
          {clients.map((client, index) => {
            const delay = index * 0.08;
            const itemProgress = phaseProgress(listIn, delay, delay + 0.3);
            const isSelected = index === 0 && composeIn > 0.3;
            
            return (
              <motion.div
                key={client.name}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                  isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-card/50'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: itemProgress, x: 0 }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center">
                  <span className="text-[8px] font-medium text-primary-foreground">{client.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-medium text-foreground truncate">{client.name}</p>
                  <p className="text-[7px] text-muted-foreground truncate">{client.email}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Compose panel */}
      <motion.div
        className="w-1/2 p-2 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: composeIn }}
      >
        {/* Message type tabs */}
        <div className="flex gap-1 mb-2">
          <motion.div
            className="flex-1 flex items-center justify-center gap-1 py-1 bg-primary/10 rounded-md border border-primary/20"
            animate={{ scale: sendAnimation > 0 ? 0.95 : 1 }}
          >
            <Mail className="w-3 h-3 text-primary" />
            <span className="text-[8px] text-primary">Email</span>
          </motion.div>
          <div className="flex-1 flex items-center justify-center gap-1 py-1 bg-muted/50 rounded-md">
            <MessageCircle className="w-3 h-3 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">WhatsApp</span>
          </div>
        </div>

        {/* Email compose */}
        <div className="flex-1 bg-card rounded-lg border border-border/50 p-2 flex flex-col">
          <motion.div 
            className="text-[8px] text-muted-foreground mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: composeIn }}
          >
            To: Sarah Johnson
          </motion.div>
          
          <motion.div
            className="flex-1 bg-muted/30 rounded p-1.5 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: composeIn }}
          >
            <p className="text-[8px] text-foreground leading-relaxed">
              Hi Sarah, please find attached your quote for the living room curtains...
            </p>
          </motion.div>

          {/* Attachment */}
          <motion.div
            className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded mb-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: composeIn > 0.5 ? 1 : 0,
              x: composeIn > 0.5 ? 0 : 20
            }}
          >
            <FileText className="w-3 h-3 text-primary" />
            <span className="text-[7px] text-foreground">Quote_SJ_001.pdf</span>
          </motion.div>

          {/* Send button */}
          <motion.button
            className="flex items-center justify-center gap-1 py-1.5 bg-primary rounded-lg"
            animate={{
              scale: sendAnimation > 0.3 && sendAnimation < 0.8 ? 0.95 : 1,
            }}
          >
            {confirmIn > 0.5 ? (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Check className="w-3 h-3 text-primary-foreground" />
                <span className="text-[9px] font-medium text-primary-foreground">Sent!</span>
              </motion.div>
            ) : (
              <>
                <Send className="w-3 h-3 text-primary-foreground" />
                <span className="text-[9px] font-medium text-primary-foreground">Send</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Flying message animation */}
      {sendAnimation > 0.3 && sendAnimation < 0.9 && (
        <motion.div
          className="absolute w-8 h-6 bg-primary rounded shadow-lg flex items-center justify-center"
          initial={{ right: "25%", top: "60%", rotate: 0 }}
          animate={{
            right: [null, "5%", "-10%"],
            top: [null, "30%", "20%"],
            rotate: [0, -10, -20],
            scale: [1, 0.8, 0.6],
            opacity: [1, 0.8, 0],
          }}
          transition={{ duration: 0.8 }}
        >
          <Mail className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}
    </div>
  );
};
