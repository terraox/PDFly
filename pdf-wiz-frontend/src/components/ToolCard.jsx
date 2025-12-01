import { motion } from "framer-motion";
import ProBadge from "./ProBadge";

export default function ToolCard({ icon: Icon, title, desc, color, isPro }) {
  const colorMap = {
    red: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    green: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    blue: "bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    purple: "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    yellow: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    gray: "bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    violet: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={(e) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top } = currentTarget.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;
        currentTarget.style.setProperty("--x", `${x}px`);
        currentTarget.style.setProperty("--y", `${y}px`);
      }}
      className="group relative flex h-[240px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl glass-card p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />

      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--x) var(--y), rgba(99, 102, 241, 0.15), transparent 40%)`
        }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colorMap[color] || colorMap.gray} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
            <Icon className="h-7 w-7" strokeWidth={2} />
          </div>
          {isPro && <ProBadge />}
        </div>

        <h3 className="mb-2 text-lg font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {title}
        </h3>

        <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}