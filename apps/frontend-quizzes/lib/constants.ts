export const CATEGORY_NAMES: Record<string, string> = {
    javascript: "JavaScript",
    react: "React",
    typescript: "TypeScript",
    css: "CSS & Layouts",
    "css & web": "CSS & Layouts",
    nextjs: "Next.js",
    performance: "Web Performance",
    security: "Web Security",
    dsa: "DSA",
    "system-design": "System Design",
    "system design": "System Design",
    behavioral: "Behavioral",
};

export const getCategoryDisplayName = (category: string) => {
    if (!category) return "";
    return CATEGORY_NAMES[category.toLowerCase()] || (category.charAt(0).toUpperCase() + category.slice(1));
};

export const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

export const DIFFICULTY_STYLES: Record<string, { badge: string; text: string; bg: string; border: string; glow: string; simpleBadge: string }> = {
    easy: {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/5',
        simpleBadge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    medium: {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/5',
        simpleBadge: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    hard: {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        glow: 'shadow-rose-500/5',
        simpleBadge: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    },
};

export const getCategoryBadgeClass = (cat: string) => {
    if (!cat) return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
    switch (cat.toLowerCase()) {
        case 'javascript':
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'react':
            return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        case 'typescript':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'css':
        case 'css & web':
            return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'nextjs':
            return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        case 'performance':
            return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'security':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        case 'system design':
        case 'system-design':
            return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        case 'behavioral':
            return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
        default:
            return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
    }
};

export const getBeamColor = (cat: string) => {
    if (!cat) return '#6366f1';
    switch (cat.toLowerCase()) {
        case 'react': return '#0ea5e9';
        case 'javascript': return '#eab308';
        case 'css':
        case 'css & web': return '#a855f7';
        case 'system design':
        case 'system-design': return '#6366f1';
        case 'typescript': return '#3b82f6';
        case 'nextjs': return '#64748b';
        case 'performance': return '#f97316';
        case 'security': return '#ef4444';
        case 'behavioral': return '#14b8a6';
        default: return '#6366f1';
    }
};
