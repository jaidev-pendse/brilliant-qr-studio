import React from 'react';
import { cn } from '@/lib/utils';

interface PrintTemplateCardProps {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  preview?: React.ReactNode;
}

export const PrintTemplateCard: React.FC<PrintTemplateCardProps> = ({
  value,
  label,
  description,
  icon,
  isSelected,
  onClick,
  preview,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-md border-2 p-3 transition-all",
        "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        "text-left w-full",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-muted bg-popover hover:border-primary/50"
      )}
    >
      {preview ? (
        <div className="w-full aspect-[4/3] mb-2 rounded overflow-hidden bg-background border border-border/50">
          {preview}
        </div>
      ) : (
        <div className="mb-2">{icon}</div>
      )}
      <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
      <span className="text-xs text-muted-foreground text-center">{description}</span>
    </button>
  );
};
