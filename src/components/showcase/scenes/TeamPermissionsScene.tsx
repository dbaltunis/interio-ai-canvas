import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Users, Shield, Crown, UserCog, User, Building2, FolderOpen, Eye, Edit2, Trash2, Check } from "lucide-react";

interface SceneProps { progress: number; }

const roles = [
  { id: "owner", label: "Owner", icon: Crown, color: "bg-amber-500" },
  { id: "admin", label: "Admin", icon: Shield, color: "bg-purple-500" },
  { id: "manager", label: "Manager", icon: UserCog, color: "bg-blue-500" },
  { id: "staff", label: "Staff", icon: User, color: "bg-emerald-500" },
  { id: "dealer", label: "Dealer", icon: Building2, color: "bg-orange-500" },
];

const permissionCategories = [
  { name: "Jobs", icon: FolderOpen, perms: [{ key: "view", label: "View", icon: Eye }, { key: "create", label: "Create", icon: Edit2 }, { key: "delete", label: "Delete", icon: Trash2 }] },
  { name: "Clients", icon: Users, perms: [{ key: "view", label: "View", icon: Eye }, { key: "edit", label: "Edit", icon: Edit2 }] },
];

const rolePerms: Record<string, Record<string, boolean>> = {
  manager: { view: true, create: true, delete: false, "clients.view": true, "clients.edit": true },
};

export const TeamPermissionsScene = ({ progress }: SceneProps) => {
  const rolesIn = phaseProgress(progress, 0, 0.25);
  const permissionsIn = phaseProgress(progress, 0.2, 0.5);
  const toggleAnim = phaseProgress(progress, 0.45, 0.7);
  const scopeIn = phaseProgress(progress, 0.65, 0.9);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex">
      <motion.div className="w-[90px] bg-card border-r border-border p-2 space-y-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: rolesIn, x: 0 }}>
        <div className="flex items-center gap-1 mb-2"><Shield className="w-3.5 h-3.5 text-primary" /><span className="text-[9px] font-semibold">Roles</span></div>
        {roles.map((role, i) => {
          const Icon = role.icon;
          const isSelected = i === 2;
          return (
            <motion.div key={role.id} className={`flex items-center gap-1.5 p-1.5 rounded-lg ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: phaseProgress(rolesIn, i * 0.05, i * 0.05 + 0.2) }}>
              <div className={`w-5 h-5 rounded-md ${role.color} flex items-center justify-center`}><Icon className="w-3 h-3 text-white" /></div>
              <span className="text-[9px] font-medium">{role.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div className="p-2 border-b border-border" initial={{ opacity: 0 }} animate={{ opacity: permissionsIn }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center"><UserCog className="w-4 h-4 text-white" /></div>
            <div><h3 className="text-[11px] font-semibold">Manager Permissions</h3><p className="text-[8px] text-muted-foreground">Manage jobs & clients</p></div>
          </div>
        </motion.div>
        <div className="flex-1 p-2 space-y-2 overflow-auto">
          {permissionCategories.map((cat, ci) => {
            const CatIcon = cat.icon;
            return (
              <motion.div key={cat.name} className="bg-card border border-border rounded-lg overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: phaseProgress(permissionsIn, ci * 0.15, ci * 0.15 + 0.3), y: 0 }}>
                <div className="flex items-center gap-1.5 p-2 bg-muted/30 border-b border-border"><CatIcon className="w-3.5 h-3.5 text-primary" /><span className="text-[10px] font-semibold">{cat.name}</span></div>
                <div className="p-1.5 space-y-1">
                  {cat.perms.map((perm, pi) => {
                    const permKey = ci === 0 ? perm.key : `clients.${perm.key}`;
                    const isOn = rolePerms.manager[permKey] ?? false;
                    const isToggling = toggleAnim > 0.3 && toggleAnim < 0.7 && pi === 1 && ci === 0;
                    const PermIcon = perm.icon;
                    return (
                      <motion.div key={perm.key} className={`flex items-center justify-between p-1.5 rounded-md ${isToggling ? 'bg-primary/10' : ''}`} animate={isToggling ? { scale: [1, 1.02, 1] } : {}}>
                        <div className="flex items-center gap-2"><PermIcon className="w-3 h-3 text-muted-foreground" /><span className="text-[9px]">{perm.label}</span></div>
                        <motion.div className={`w-7 h-4 rounded-full relative ${isOn ? 'bg-primary' : 'bg-muted'}`} animate={isToggling ? { scale: [1, 1.1, 1] } : {}}>
                          <motion.div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm" animate={{ left: isOn ? "calc(100% - 14px)" : "2px" }} />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
          <AnimatePresence>{scopeIn > 0 && (
            <motion.div className="bg-card border border-border rounded-lg p-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: scopeIn, y: 0 }}>
              <div className="flex items-center gap-1.5 mb-2"><Eye className="w-3.5 h-3.5 text-primary" /><span className="text-[10px] font-semibold">Data Scope</span></div>
              <div className="flex gap-1">{["All", "Assigned", "Own"].map((s, i) => (<motion.div key={s} className={`flex-1 py-1.5 rounded-md text-center text-[8px] font-medium ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</motion.div>))}</div>
            </motion.div>
          )}</AnimatePresence>
        </div>
        <motion.div className="p-2 border-t border-border" initial={{ opacity: 0 }} animate={{ opacity: scopeIn }}>
          <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium"><Check className="w-3 h-3" />Save Permissions</button>
        </motion.div>
      </div>
    </div>
  );
};
