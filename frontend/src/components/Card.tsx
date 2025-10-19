"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  color?: string; // optional color override
}

const ZamanColors = {
  PersianGreen: "#2D9A86",
  Solar: "#EEFE6D",
  Cloud: "#FFFFFF",
  LightTeal: "#B8E6DC",
  DarkTeal: "#1A5F52",
};

export function Card({ title, children, className = "", color }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl shadow-lg border border-gray-100 bg-[${color || ZamanColors.Cloud}] p-5 ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-[${ZamanColors.DarkTeal}] mb-3">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="text-gray-800">{children}</div>;
}
