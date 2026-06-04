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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  if (!banners.length) {
    return (
      <div className="relative h-[60vh] md:h-[80vh] bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <Image src="/logo-gracie-barra.jpg" alt="Logo" width={120} height={120} className="mx-auto rounded-full border-4 border-red-600 mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-4">GRACIE BARRA</h1>
          <p className="text-red-400 text-xl md:text-2xl font-bold tracking-widest mb-2">PENDOTIBA</p>
          <p className="text-gray-300 text-lg">Jiu-Jitsu & Defesa Pessoal</p>
          <p className="text-gray-400 mt-2">Niterói - RJ</p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link href="/agendar" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all">
              Agende sua Aula Grátis
            </Link>
            <Link href="#horarios-aula" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-bold text-lg transition-all">
              Ver Horários
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner) => (
          <div key={banner.id} className="flex-none w-full relative h-[60vh] md:h-[80vh]">
            <Image
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {(banner.title || banner.description) && (
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
                {banner.title && <h2 className="text-3xl md:text-5xl font-black mb-2">{banner.title}</h2>}
                {banner.description && <p className="text-lg md:text-xl text-gray-200">{banner.description}</p>}
                {banner.linkUrl && (
                  <Link href={banner.linkUrl} className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold">
                    Saiba mais
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === selectedIndex ? "bg-red-500 scale-125" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          >
            <svg width="24" height="24" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          >
            <svg width="24" height="24" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
