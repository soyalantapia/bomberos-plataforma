'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { forwardRef } from 'react';

/** Variants: aparecer suavemente desde abajo. */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Variants: aparecer desde la izquierda. */
export const slideRight: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
};

/** Container que stagger-animа sus hijos directos con índice. */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

/** Wrapper de un div que fade-up al montarse. */
export const FadeUp = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(function FadeUp(
  { children, ...props },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      variants={fadeUp}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

/** Container con stagger para listas que entran en cascada. */
export const Stagger = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(function Stagger(
  { children, ...props },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
});

/** Item de stagger: combina con `Stagger` arriba. */
export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(function StaggerItem(
  { children, ...props },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

/** Botón / card que tiene un efecto sutil de "press" al click. */
export const Tappable = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(function Tappable(
  { children, ...props },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
