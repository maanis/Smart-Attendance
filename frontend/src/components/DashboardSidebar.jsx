import { motion, AnimatePresence } from "framer-motion";
import {
    Home, Users, Calendar, FileText, Settings, BarChart3, UserCheck, Clock,
    ChevronLeft, ChevronRight, LogOut, ChevronDown, RefreshCw, ChevronUp,
    BookOpen, GraduationCap, CheckCircle, AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// UI Components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// User data - you can replace this with actual user data from your auth system
const userData = {
    name: "Teacher Name",
    email: "teacher@example.com",
    avatarUrl: "https://github.com/shadcn.png",
    role: "Teacher",
    department: "Computer Science"
};

// Navigation items for attendance system
const navItems = [
    { name: "Dashboard", icon: Home, path: "/teacher/dashboard" },
    { name: "Sessions", icon: Clock, path: "/teacher/sessions" },
    {
        name: "Students Management",
        icon: CheckCircle,
        children: [
            { name: "Add Students", icon: FileText, path: "/teacher/students/add" },
            { name: "All Students", icon: BarChart3, path: "/teacher/students" },
        ],
    },
    { name: "Settings", icon: Settings, path: "/teacher/settings" },
];

const NavLink = ({ item, collapsed, isActive }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Link
                to={item.path}
                className={cn(
                    "flex items-center gap-4 pl-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-zinc-400/20 hover:text-black transition-colors",
                    isActive && "border-r-[4px] border-accent w-full",
                    collapsed ? "justify-center" : "justify-start"
                )}
            >
                <item.icon size={18} />
                {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
    </Tooltip>
);

export default function DashboardSidebar({ className }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    // State to hold the name of the single open menu
    const [openMenu, setOpenMenu] = useState(null);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    // Toggles a menu. If it's already open, it closes. Otherwise, it opens the new one.
    const handleMenuToggle = (name) => {
        setOpenMenu(prev => (prev === name ? null : name));
    };

    const handleRefresh = () => {
        console.log("Refreshing user data...");
        // API call to refetch user data would go here
    };

    return (
        <TooltipProvider delayDuration={100}>
            <div
                className={cn(
                    "flex flex-col h-screen border-r bg-background text-foreground transition-all duration-300 ease-in-out",
                    collapsed ? "w-20" : "w-64",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b h-16">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Room Checkr Logo"
                                width={24}
                                height={24}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <span className="font-bold text-xl">Attend-Ex</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setOpenMenu(null);
                            setCollapsed(!collapsed);
                        }}
                        className="h-8 w-8"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 overflow-y-auto mt-2">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isMenuOpen = openMenu === item.name;
                            const isChildActive = item.children?.some(child => location.pathname.startsWith(child.path));

                            return item.children ? (
                                <Tooltip>
                                    <TooltipTrigger key={item.name}>
                                        <button
                                            onClick={() => {
                                                collapsed && setCollapsed(false);
                                                handleMenuToggle(item.name);
                                            }}
                                            className={cn(
                                                "flex items-center w-full gap-4 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-zinc-300/20 hover:text-black transition-colors",
                                                collapsed ? "justify-center" : "justify-between"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <item.icon size={18} />
                                                {!collapsed && <span className="truncate">{item.name}</span>}
                                            </div>
                                            {!collapsed && (
                                                <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={16} />
                                                </motion.div>
                                            )}
                                        </button>
                                        <AnimatePresence>
                                            {!collapsed && isMenuOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="flex flex-col ml-5 pl-2 border-l border-dashed"
                                                >
                                                    {item.children.map((child) => (
                                                        <NavLink key={child.name} item={child} collapsed={collapsed} isActive={location.pathname === child.path} />
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </TooltipTrigger>
                                    {collapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
                                </Tooltip>
                            ) : (
                                <NavLink key={item.name} item={item} collapsed={collapsed} isActive={location.pathname === item.path} />
                            );
                        })}
                    </nav>
                </ScrollArea>

                {/* User Profile & Logout Section */}
                <div className="mt-auto p-2 border-t">
                    {/* Profile Accordion */}
                    <div className="flex flex-col">
                        <button
                            onClick={() => {
                                collapsed && setCollapsed(false);
                                handleMenuToggle('Profile');
                            }}
                            className="p-2 rounded-lg hover:bg-muted w-full"
                        >
                            <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "justify-between")}>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                                        <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {!collapsed && (
                                        <div className="flex flex-col text-sm text-left">
                                            <span className="font-semibold truncate">{userData.name}</span>
                                            <span className="text-muted-foreground">{userData.role}</span>
                                        </div>
                                    )}
                                </div>
                                {!collapsed && (
                                    <motion.div animate={{ rotate: openMenu === 'Profile' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <ChevronUp size={16} />
                                    </motion.div>
                                )}
                            </div>
                        </button>

                        <AnimatePresence>
                            {!collapsed && openMenu === 'Profile' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="text-sm text-muted-foreground p-3 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Email:</span>
                                            <span className="font-medium text-foreground truncate">{userData.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Department:</span>
                                            <span className="font-medium text-foreground">{userData.department}</span>
                                        </div>
                                        <Button onClick={handleRefresh} variant="outline" size="sm" className="w-full">
                                            <RefreshCw size={14} className="mr-2" />
                                            Refresh Data
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Logout Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "flex items-center gap-4 w-full text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-colors mt-1",
                                            collapsed ? "justify-center px-0" : "justify-start px-3"
                                        )}
                                    >
                                        <LogOut size={18} />
                                        {!collapsed && "Logout"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>You will be logged out. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleLogout}>Logout</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}