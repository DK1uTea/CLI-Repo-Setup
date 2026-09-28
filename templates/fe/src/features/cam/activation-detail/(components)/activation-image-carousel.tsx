'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/shared/components/ui/carousel';
import { useUserStore } from "@/shared/stores/use-user-store";
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from "@/shared/constants/permissions";
import { useSubscribeActivation, useUnsubscribeActivation } from '../(hooks)/use-subscribe-activation';
import { useTranslations } from 'next-intl';

export type ResponsiveMediaHeight = {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
};

export type MediaHeightValue = number | string | ResponsiveMediaHeight;

type Props = {
  images: string[];
  altPrefix?: string;
  mediaHeight?: MediaHeightValue;
  activationId?: string | null;
  isSubscribed?: boolean;
};

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'avi']);

function isVideoUrl(url: string): boolean {
  const ext = url?.split('?')[0]?.split('.').pop()?.toLowerCase();
  return VIDEO_EXTENSIONS.has(ext ?? '');
}

export function ActivationImageCarousel({
  images,
  altPrefix = 'Image',
  mediaHeight = 400,
  activationId,
  isSubscribed = false,
}: Props) {
  const t = useTranslations('activationView');
  const permissions = useUserStore((s) => s.permissions);
  const isAdmin =
    permissions?.includes(PERMISSION_ALL_WILDCARD) ||
    permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin);

  const { mutate: subscribe, isPending: isSubscribing } = useSubscribeActivation();
  const { mutate: unsubscribe, isPending: isUnsubscribing } = useUnsubscribeActivation();

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Resolve height inline without useMemo (as optimized by compiler)
  const resolvedHeight = (() => {
    if (typeof mediaHeight !== 'object' || mediaHeight === null) return mediaHeight;
    return mediaHeight.xs ?? 400;
  })();

  const normalizedHeight = typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight;

  const handleSubscribeToggle = () => {
    if (!activationId) return;
    if (isSubscribed) {
      unsubscribe(activationId);
    } else {
      subscribe(activationId);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div
        className="relative w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground"
        style={{ height: normalizedHeight }}
      >
        <span>{t('drawer.noImages')}</span>

        {isAdmin && activationId && (
          <div className="absolute top-3 right-3 z-10">
            <Button
              size="sm"
              onClick={handleSubscribeToggle}
              disabled={isSubscribing || isUnsubscribing}
            >
              {isSubscribed ? t('drawer.unsubscribe') : t('drawer.subscribe')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="relative w-full overflow-hidden rounded-lg" style={{ height: normalizedHeight }}>
                {isVideoUrl(image) ? (
                  <video
                    src={image}
                    controls
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Image
                    src={image}
                    alt={`${altPrefix} - ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40 border-none backdrop-blur-md size-10 rounded-full [&_svg]:size-5" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40 border-none backdrop-blur-md size-10 rounded-full [&_svg]:size-5" />
          </>
        )}
      </Carousel>

      {/* Subscribe Button Overlay */}
      {isAdmin && activationId && (
        <div className="absolute top-3 right-3 z-10">
          <Button
            size="sm"
            onClick={handleSubscribeToggle}
            disabled={isSubscribing || isUnsubscribing}
          >
            {isSubscribed ? t('drawer.unsubscribe') : t('drawer.subscribe')}
          </Button>
        </div>
      )}

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 bg-black/20 backdrop-blur-md rounded-full px-2.5 py-1.5 z-10">
          {Array.from({ length: count }).map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon-xs"
              onClick={() => api?.scrollTo(index)}
              aria-current={index === current ? 'true' : 'false'}
              className={cn(
                "rounded-full p-0 border-none transition-all active:translate-y-0 focus-visible:ring-0 min-w-0 min-h-0 size-auto hover:bg-transparent",
                index === current ? "bg-white" : "bg-white/40"
              )}
              style={{
                width: index === current ? '8px' : '6px',
                height: index === current ? '8px' : '6px',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivationImageCarousel;
