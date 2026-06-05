"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import EventCard from "./EventCard";

type Event = {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  date: Date;
  location: string;
  status: string;
  registrationOpen: boolean;
  price: number;
  maxParticipants: number | null;
  _count: { registrations: number };
};

export default function EventCarousel({ events }: { events: Event[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
    breakpoints: {
      "(min-width: 640px)": { active: false }, // desativa em tablets/desktop
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const updateScrollSnaps = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    requestAnimationFrame(() => {
      updateScrollSnaps();
      updateSelectedIndex();
    });
    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateScrollSnaps);
    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateScrollSnaps);
    };
  }, [emblaApi, updateScrollSnaps, updateSelectedIndex]);

  return (
    <div>
      {/* Mobile: carousel | Desktop: grid */}
      <div className="sm:hidden overflow-hidden -mx-4" ref={emblaRef}>
        <div className="flex pl-4 gap-3">
          {events.map((e, i) => (
            <div key={e.id} className="flex-none w-[82vw] max-w-[340px]">
              <EventCard event={e} count={e._count.registrations} priority={i === 0} />
            </div>
          ))}
          {/* Spacer final para o último card não ficar colado na borda */}
          <div className="flex-none w-4" />
        </div>
      </div>

      {/* Dots — mobile */}
      {scrollSnaps.length > 1 && (
        <div className="sm:hidden flex justify-center gap-1.5 mt-3">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Evento ${i + 1}`}
              className={`rounded-full transition-all duration-200 ${
                i === selectedIndex
                  ? "bg-red-500 w-5 h-1.5"
                  : "bg-gray-700 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* Grid — tablet e desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e) => (
          <EventCard key={e.id} event={e} count={e._count.registrations} />
        ))}
      </div>
    </div>
  );
}
