import React from 'react';
import { AlertCircle } from 'lucide-react';

export function DetailDrawerNoData() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center py-20 gap-4 animate-in fade-in-50 duration-200">
      <div className="p-3 bg-muted rounded-full text-muted-foreground">
        <AlertCircle className="size-10" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">No activation details</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          The requested activation detail is unavailable or could not be loaded at this time.
        </p>
      </div>
    </div>
  );
}

export default DetailDrawerNoData;
