'use client';

import type { Ref } from 'react';

type Props = {
  contentRef: Ref<HTMLDivElement>;
  children: React.ReactNode;
  padding?: string;
};

export function EventCommonPdfContentWrapper({ contentRef, children, padding = '25px' }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: -1,
        top: 0,
        left: 0,
        width: '100vw',
        overflow: 'hidden',
        height: 0,
      }}
      aria-hidden
    >
      <div
        ref={contentRef}
        style={{
          boxSizing: 'border-box',
          width: '210mm',
          minHeight: '297mm',
          padding,
          margin: '0',
          background: '#ffffff',
        }}
      >
        {children}
      </div>
    </div>
  );
}
