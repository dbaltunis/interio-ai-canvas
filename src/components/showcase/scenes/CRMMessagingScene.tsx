import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress, typingProgress } from "@/lib/demoAnimations";
import { 
  Users, Mail, MessageCircle, Send, Check, Star, 
  FolderKanban, MoreVertical, Paperclip, FileText,
  Search, Filter, Plus, CheckCircle
} from "lucide-react";

interface SceneProps {
  progress: number;
}

// Client data matching real DemoClientCard
const clients = [
  { 
    name: "Sarah Johnson", 
    email: "sarah@email.com", 
    stage: "proposal",
    value: "$4,250",
    projects: 2,
    isHot: true,
    avatar: "SJ",
    color: "bg-blue-500"
  },
  { 
    name: "Chen Industries", 
    email: "mike@chen.co", 
    stage: "negotiation",
    value: "$12,800",
    projects: 1,
    isHot: false,
    avatar: "CI",
    color: "bg-emerald-500"
  },
  { 
    name: "Emma Davis", 
    email: "emma@mail.com", 
    stage: "lead",
    value: "$0",
    projects: 0,
    isHot: false,
    avatar: "ED",
    color: "bg-purple-500"
  },
];

// Stage colors matching real app
const stageColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-purple-100 text-purple-700 border-purple-200",
  proposal: "bg-yellow-100 text-yellow-700 border-yellow-200",
  negotiation: "bg-orange-100 text-orange-700 border-orange-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const CRMMessagingScene = ({ progress }: SceneProps) => {
  const clientsIn = phaseProgress(progress, 0, 0.3);
  const selectionIn = phaseProgress(progress, 0.25, 0.4);
  const composeIn = phaseProgress(progress, 0.35, 0.55);
  const typingIn = phaseProgress(progress, 0.5, 0.75);
  const sendIn = phaseProgress(progress, 0.7, 0.9);
  const successIn = phaseProgress(progress, 0.85, 1);

  const selectedClientIndex = selectionIn > 0.5 ? 0 : -1;
  const emailText = typingProgress(typingIn, 0, 1, "Hi Sarah, I'm pleased to share your quote for the living room curtains project. Please find the attached PDF with full details...");

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex">
      {/* Left panel - Client list */}
      <motion.div 
        className="w-[100px] border-r border-border flex flex-col bg-card/30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: clientsIn, x: 0 }}
      >
        {/* Header */}
        <div className="p-2 border-b border-border">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-semibold">Clients</span>
            <span className="ml-auto px-1 py-0.5 bg-secondary text-secondary-foreground text-[7px] rounded">156</span>
          </div>
          <div className="h-6 rounded-md border border-input bg-background flex items-center gap-1 px-1.5">
            <Search className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[7px] text-muted-foreground">Search...</span>
          </div>
        </div>

        {/* Client list */}
        <div className="flex-1 p-1.5 space-y-1 overflow-auto">
          {clients.map((client, index) => {
            const itemDelay = index * 0.08;
            const itemProgress = phaseProgress(clientsIn, itemDelay + 0.2, itemDelay + 0.4);
            const isSelected = index === selectedClientIndex;
            
            return (
              <motion.div
                key={client.name}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: itemProgress, 
                  x: 0,
                  scale: isSelected ? 1.02 : 1
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full ${client.color} flex items-center justify-center shrink-0`}>
                    <span className="text-[7px] font-medium text-white">{client.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-0.5">
                      <p className="text-[8px] font-medium truncate">{client.name}</p>
                      {client.isHot && <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-1 py-0.5 rounded text-[6px] font-medium border ${stageColors[client.stage]}`}>
                        {client.stage.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Right panel - Email compose */}
      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: composeIn }}
      >
        {/* Message type tabs */}
        <div className="flex gap-1 p-2 border-b border-border">
          <motion.div
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary/10 rounded-md border border-primary/20"
            animate={composeIn > 0.5 ? { scale: [1, 1.02, 1] } : {}}
          >
            <Mail className="w-3 h-3 text-primary" />
            <span className="text-[8px] text-primary font-medium">Email</span>
          </motion.div>
          <div className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-muted/50 rounded-md">
            <MessageCircle className="w-3 h-3 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">WhatsApp</span>
          </div>
        </div>

        {/* Email composer */}
        <div className="flex-1 p-2 flex flex-col">
          {/* To field */}
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border">
            <span className="text-[8px] text-muted-foreground">To:</span>
            <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-[6px] text-white font-medium">SJ</span>
              </div>
              <span className="text-[8px]">Sarah Johnson</span>
            </div>
          </div>

          {/* Subject */}
          <motion.div 
            className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: composeIn > 0.3 ? 1 : 0 }}
          >
            <span className="text-[8px] text-muted-foreground">Subject:</span>
            <span className="text-[8px] font-medium">Your Quote for Living Room Curtains</span>
          </motion.div>

          {/* Email body */}
          <motion.div 
            className="flex-1 bg-muted/30 rounded-lg p-2 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: composeIn > 0.5 ? 1 : 0 }}
          >
            <p className="text-[8px] leading-relaxed">
              {emailText}
              {typingIn < 1 && typingIn > 0 && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline-block w-0.5 h-3 bg-primary ml-0.5 align-middle"
                />
              )}
            </p>
          </motion.div>

          {/* Attachment */}
          <AnimatePresence>
            {typingIn > 0.8 && (
              <motion.div
                className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded mb-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <div className="flex-1">
                  <p className="text-[8px] font-medium">Quote_SarahJ_P1234.pdf</p>
                  <p className="text-[6px] text-muted-foreground">245 KB</p>
                </div>
                <Paperclip className="w-3 h-3 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Send button */}
          <motion.button
            className="flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground rounded-lg"
            animate={{
              scale: sendIn > 0.3 && sendIn < 0.7 ? 0.95 : 1,
            }}
          >
            {successIn > 0.5 ? (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-medium">Sent!</span>
              </motion.div>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Send Email</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Flying email animation */}
      <AnimatePresence>
        {sendIn > 0.3 && sendIn < 0.9 && (
          <motion.div
            className="absolute w-8 h-6 bg-primary rounded shadow-lg flex items-center justify-center"
            initial={{ right: "30%", top: "70%", rotate: 0, opacity: 1 }}
            animate={{
              right: [null, "10%", "-5%"],
              top: [null, "40%", "30%"],
              rotate: [0, -15, -25],
              scale: [1, 0.8, 0.5],
              opacity: [1, 0.8, 0],
            }}
            transition={{ duration: 0.8 }}
          >
            <Mail className="w-3 h-3 text-primary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
