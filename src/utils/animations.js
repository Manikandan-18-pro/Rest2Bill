// ─── Shared Animation Utilities ──────────────────────────────────────────────
// Used consistently across every page for a cohesive, premium feel

export const SPRING = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 };
export const SPRING_SLOW = { type: 'spring', stiffness: 220, damping: 28, mass: 1 };
export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_INOUT = [0.4, 0, 0.2, 1];

/** Standard fade-up entry for cards / sections */
export function fadeUp(delay = 0, duration = 0.55) {
  return {
    initial: { opacity: 0, y: 28, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { delay, duration, ease: EASE_OUT },
  };
}

/** Slide in from the left */
export function fadeLeft(delay = 0, duration = 0.55) {
  return {
    initial: { opacity: 0, x: -24, filter: 'blur(3px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    transition: { delay, duration, ease: EASE_OUT },
  };
}

/** Slide in from the right */
export function fadeRight(delay = 0, duration = 0.55) {
  return {
    initial: { opacity: 0, x: 24, filter: 'blur(3px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    transition: { delay, duration, ease: EASE_OUT },
  };
}

/** Scale + fade pop for badges, modals, dialogs */
export function scalePop(delay = 0) {
  return {
    initial: { opacity: 0, scale: 0.88, y: 16, filter: 'blur(6px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    exit:    { opacity: 0, scale: 0.94, y: 8, filter: 'blur(2px)' },
    transition: { delay, ...SPRING },
  };
}

/** Stagger children helper — pass to parent's variants */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.5, ease: EASE_OUT } },
};

/** Table row stagger item */
export const rowItem = {
  hidden: { opacity: 0, x: -14, filter: 'blur(2px)' },
  show:   { opacity: 1, x: 0,   filter: 'blur(0px)',
    transition: { duration: 0.38, ease: EASE_OUT } },
};

/** Page-level wrapper — wraps <Outlet /> */
export const pageVariants = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.52, ease: EASE_OUT } },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)',
    transition: { duration: 0.28, ease: EASE_INOUT } },
};

/** Hover lift for cards */
export const cardHover = {
  whileHover: {
    y: -5,
    scale: 1.012,
    boxShadow: '0 20px 56px rgba(40,110,70,0.18)',
    transition: { duration: 0.3, ease: EASE_OUT },
  },
  whileTap: { scale: 0.985, transition: { duration: 0.15 } },
};

/** Button press */
export const buttonTap = {
  whileHover: { scale: 1.035, transition: { duration: 0.22, ease: EASE_OUT } },
  whileTap:   { scale: 0.96,  transition: { duration: 0.12 } },
};
