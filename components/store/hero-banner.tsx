"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/store/product-image";
import { cn } from "@/lib/utils";

export type Slide = {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  emphasis?: string;
  copy: string;
  href: string;
  cta: string;
};

function SlideTitle({ slide }: { slide: Slide }) {
  if (!slide.emphasis) return slide.title;

  const parts = slide.title.split(slide.emphasis);
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? (
        <span className="italic">{slide.emphasis}</span>
      ) : null}
    </span>
  ));
}

export function HeroBanner({ slides }: { slides: Slide[] }) {
  const plugins = useRef([
    Fade(),
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    }),
  ]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1, duration: 20 },
    plugins.current,
  );
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      emblaApi?.plugins().autoplay?.reset();
    },
    [emblaApi],
  );

  const scrollBy = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") emblaApi?.scrollPrev();
      else emblaApi?.scrollNext();
      emblaApi?.plugins().autoplay?.reset();
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) emblaApi.plugins().autoplay?.stop();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="group relative h-[60vh] min-h-[420px] overflow-hidden bg-store-ink md:h-[80vh]"
    >
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={`${slide.href}-${index}`}
              className="relative min-w-0 flex-[0_0_100%]"
              aria-hidden={selected !== index}
            >
              <ProductImage
                src={slide.image}
                alt={slide.alt}
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="max-w-3xl text-center text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/80">
                    {slide.kicker}
                  </p>
                  {selected === index ? (
                    <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight drop-shadow-md sm:text-7xl">
                      <SlideTitle slide={slide} />
                    </h1>
                  ) : (
                    <p className="mt-4 font-display text-5xl leading-[0.95] tracking-tight drop-shadow-md sm:text-7xl">
                      <SlideTitle slide={slide} />
                    </p>
                  )}
                  <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 drop-shadow sm:text-lg">
                    {slide.copy}
                  </p>
                  <Link
                    href={slide.href}
                    tabIndex={selected === index ? 0 : -1}
                    className="mt-8 inline-flex h-12 items-center bg-store-sand px-8 text-sm text-store-ink hover:bg-white"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => scrollBy("prev")}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/25 p-3 text-white/70 opacity-100 backdrop-blur-sm transition hover:bg-black/45 hover:text-white focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <ChevronLeft className="size-7" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => scrollBy("next")}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/25 p-3 text-white/70 opacity-100 backdrop-blur-sm transition hover:bg-black/45 hover:text-white focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <ChevronRight className="size-7" />
          </button>
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
            {slides.map((slide, index) => (
              <button
                key={`${slide.href}-${index}`}
                type="button"
                aria-label={`Show ${slide.title}`}
                aria-current={selected === index ? "true" : undefined}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  selected === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
