'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { generatePdfFromElement } from '../(helpers)/generate-pdf';

export function useDownloadPdf(errorMessage: string) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const download = async (fileName: string) => {
    if (!contentRef.current || downloading) return;
    setDownloading(true);
    try {
      await generatePdfFromElement(contentRef.current, fileName);
    } catch {
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  return { contentRef, downloading, download };
}
