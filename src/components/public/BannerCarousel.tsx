"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Banner = {
  id: string;
  imageUrl: string;
  title?: string | null;
  description?: string | null;
  linkUrl?: string | null;
};

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start" },
    [Autoplay({ delay: 2800, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () =>
      setSelectedIndex(emblaApi.selectedScrollSnap())
    );
  }, [emblaApi]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full bg-gray-950">
      {/* Scroll container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-1 sm:gap-1.5">
          {banners.map((banner, i) => (
            <div key={banner.id} className="embla-slide flex-shrink-0">
              <div
                className={`relative h-32 sm:h-48 md:h-64 overflow-hidden transition-all duration-300 ${
                  i === selectedIndex ? "brightness-100" : "brightness-75"
                }`}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || "Banner"}
                  fill
                  priority={i < 3}
                  className="object-cover object-center hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 480px) 75vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 22vw"
                />

                {/* Overlay com texto em todas as imagens */}
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4">
                    {banner.title && (
                      <p className="text-white font-bold text-xs sm:text-sm leading-tight drop-shadow line-clamp-2">
                        {banner.title}
                      </p>
                    )}
                    {banner.description && (
                      <p className="text-gray-300 text-xs mt-0.5 line-clamp-1 drop-shadow hidden sm:block">
                        {banner.description}
                      </p>
                    )}
                    {banner.linkUrl && (
                      <Link
                        href={banner.linkUrl}
                        className="mt-2 inline-flex items-center bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                      >
                        Ver mais
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows — desktop only via CSS (não renderiza no mobile) */}
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Anterior"
        className="banner-arrow absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full items-center justify-center transition-all z-10"
      >
        <svg width="16" height="16" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Próximo"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full items-center justify-center transition-all z-10"
      >
        <svg width="16" height="16" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-2 pb-1">
          {banners.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Banner ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "bg-red-500 w-4 h-1.5"
                  : "bg-gray-700 hover:bg-gray-500 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
