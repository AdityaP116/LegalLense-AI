import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'verified' | 'review' | 'conflict' | 'missing';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant: BadgeVariant;
}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  const styles = {
    verified: {
      bg: 'bg-[#ECFDF5]',
      text: 'text-[#059669]',
      border: 'border-[#A7F3D0]',
      dot: 'bg-[#059669]'
    },
    review: {
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#D97706]',
      border: 'border-[#FDE68A]',
      dot: 'bg-[#D97706]'
    },
    conflict: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      border: 'border-[#FECACA]',
      dot: 'bg-[#DC2626]'
    },
    missing: {
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#64748B]',
      border: 'border-[#CBD5E1]',
      dot: 'bg-[#64748B]'
    }
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center h-6 rounded-full px-[10px] border",
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
      {...props}
    >
      <span className={cn("w-[6px] h-[6px] rounded-full mr-[6px]", styles.dot)} />
      <span className="text-xs font-medium leading-none">{children}</span>
    </div>
  );
}
