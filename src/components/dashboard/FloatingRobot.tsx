import { motion } from "framer-motion";

const FloatingRobot = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`relative ${className}`}
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glow */}
      <motion.ellipse
        cx="60" cy="110" rx="28" ry="6"
        fill="hsl(var(--primary))"
        opacity={0.15}
        animate={{ rx: [28, 24, 28], opacity: [0.15, 0.08, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Antenna */}
      <rect x="57" y="12" width="6" height="14" rx="3" fill="hsl(var(--primary))" />
      <motion.circle
        cx="60" cy="10" r="5"
        fill="hsl(var(--primary))"
        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Head */}
      <rect x="28" y="26" width="64" height="44" rx="14" fill="hsl(var(--foreground))" />
      <rect x="32" y="30" width="56" height="36" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />

      {/* Eyes */}
      <motion.circle
        cx="45" cy="48" r="7"
        fill="hsl(var(--primary))"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="45" cy="46" r="2.5" fill="hsl(var(--primary-foreground))" opacity={0.9} />
      <motion.circle
        cx="75" cy="48" r="7"
        fill="hsl(var(--primary))"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <circle cx="75" cy="46" r="2.5" fill="hsl(var(--primary-foreground))" opacity={0.9} />

      {/* Mouth */}
      <rect x="50" y="58" width="20" height="3" rx="1.5" fill="hsl(var(--primary))" opacity={0.5} />

      {/* Body */}
      <rect x="34" y="74" width="52" height="28" rx="10" fill="hsl(var(--foreground))" />
      <rect x="38" y="78" width="44" height="20" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
      
      {/* Chest light */}
      <motion.circle
        cx="60" cy="88" r="4"
        fill="hsl(var(--primary))"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Arms */}
      <motion.rect
        x="16" y="76" width="14" height="8" rx="4"
        fill="hsl(var(--foreground))"
        animate={{ rotate: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "30px 80px" }}
      />
      <motion.rect
        x="90" y="76" width="14" height="8" rx="4"
        fill="hsl(var(--foreground))"
        animate={{ rotate: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ transformOrigin: "90px 80px" }}
      />
    </svg>
  </motion.div>
);

export default FloatingRobot;
