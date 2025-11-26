import { motion } from "framer-motion";

export default function ToolCard({ icon: Icon, title, desc, color }) {
  const colorMap = {
    red: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    green: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    blue: "bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    purple: "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    yellow: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    gray: "bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400",
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex h-[240px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:shadow-black/50"
    >
      <div>
        <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colorMap[color] || colorMap.gray} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="h-7 w-7" strokeWidth={2} />
        </div>
        
        <h3 className="mb-2 text-lg font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-red-600 dark:text-zinc-100 dark:group-hover:text-red-400">
          {title}
        </h3>
        
        <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}