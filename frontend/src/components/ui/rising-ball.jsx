import { cn } from "@/lib/utils";
import React from "react";

export const Component = ({ className = '', text = '' }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6 my-auto select-none", className)}>
      <div className="loader" role="status" aria-label="Loading..."></div>
      {text && (
        <p className="mt-6 text-xs font-mono tracking-widest uppercase text-stone-500 dark:text-stone-400 animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );
};

export const RisingBallLoader = Component;
export default Component;
