import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface CitationTokenProps extends HTMLAttributes<HTMLSpanElement> {
  documentName?: string;
  page?: number | string;
  clause?: string;
}

export function CitationToken({ documentName, page, clause, className, children, ...props }: CitationTokenProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded px-1.5 py-0.5 font-mono text-[12px] font-medium leading-4 text-[#334155] cursor-pointer hover:border-[#2563EB] hover:text-[#2563EB] transition-colors",
        className
      )}
      title={documentName ? `Source: ${documentName}` : undefined}
      {...props}
    >
      {children || (
        <>
          {page && <span>p. {page}</span>}
          {page && clause && <span>&middot;</span>}
          {clause && <span>&sect; {clause}</span>}
        </>
      )}
    </span>
  );
}
