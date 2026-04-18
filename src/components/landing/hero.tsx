"use client";

import { motion, useInView, easeOut, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import PopularProducts from "./Products";

// ─── Carousel config ──────────────────────────────────────────────────────────
const SLIDES = [
  {
    image: "/images/banner.png",
    textPosition: "center",
    line1Class:
      "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold",
    line2Class:
      "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium",
    noWrap: true,
    typeLines: ["Fulfill Your Dropshipping", "WITH UNICSI"],
    paragraph:
      "From sourcing to shipping, Unicsi simplifies dropshipping so you can focus on marketing, scaling, and growing your brand.",
  },
  {
    image: "/images/hero4.png",
    textPosition: "left",
    line1Class:
      "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold",
    line2Class:
      "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium",
    noWrap: true,
    typeLines: ["The Infrastructure", "Behind Winning Stores", "WITH UNICSI"],
    paragraph:
      "Structured sourcing, optimized logistics, and scalable systems built for serious Dropshippers who want long-term growth.",
  },
  {
    image: "/images/hero3.png",
    textPosition: "right",
    line1Class:
      "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold",
    line2Class:
      "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium",
    noWrap: false,
    typeLines: ["Smart Bulk", "Sourcing", "WITH UNICSI"],
    paragraph:
      "Source products in bulk at competitive pricing with stable inventory and structured fulfillment support. Unicsi provides reliable bulk sourcing with efficient logistics across India.",
  },
];

const LINGER_MS = 1800;
const SUBTITLE_FADE_MS = 1000;
const ACTIVE_COLOR = "#0097b2";

// ─── Typewriter ───────────────────────────────────────────────────────────────
function useTypewriter(lines: string[], speed = 55, slideIndex: number) {
  const [displayedLines, setDisplayedLines] = useState<string[]>(
    lines.map(() => ""),
  );
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [settledIndex, setSettledIndex] = useState(slideIndex);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayedLines(lines.map(() => ""));
    setCurrentLine(0);
    setCurrentChar(0);
    setDone(false);
    const t = setTimeout(() => setSettledIndex(slideIndex), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex]);

  useEffect(() => {
    if (settledIndex !== slideIndex) return;

    if (currentLine >= lines.length) {
      setDone(true);
      return;
    }
    const target = lines[currentLine];
    if (currentChar < target.length) {
      const t = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLine] = target.slice(0, currentChar + 1);
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [settledIndex, slideIndex, currentLine, currentChar, lines, speed]);

  const ready = settledIndex === slideIndex;
  return { displayedLines, done: done && ready };
}

// ─── Cursor ───────────────────────────────────────────────────────────────────
const Cursor = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      className="inline-block w-[2px] h-[0.9em] bg-white align-middle ml-1 rounded-sm"
    />
  );
};

// ─── AnimatedSection ──────────────────────────────────────────────────────────
const AnimatedSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 50, filter: "blur(8px)" }
      }
      transition={{ duration: 0.75, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Text alignment helper ────────────────────────────────────────────────────
function getTextClasses(position: string) {
  switch (position) {
    case "left":
      return {
        outerFlex: "justify-start",
        innerText: "text-left",
        padding: "pl-3 sm:pl-10 md:pl-20 lg:pl-28 xl:pl-36",
      };
    case "center":
      return {
        outerFlex: "justify-center",
        innerText: "text-center",
        padding: "px-6",
      };
    default:
      return {
        outerFlex: "justify-end",
        innerText: "text-right",
        padding: "pr-3 sm:pr-8 md:pr-16 lg:pr-24",
      };
  }
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  useInView(heroRef, { once: false, margin: "-100px" });

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + SLIDES.length) % SLIDES.length;
      const isForward =
        next > activeIndex || (activeIndex === SLIDES.length - 1 && next === 0);
      setDirection(isForward ? 1 : -1);
      setActiveIndex(next);
    },
    [activeIndex],
  );

  const currentSlide = SLIDES[activeIndex];

  // Per-slide typewriter lines
  const { displayedLines, done: typewriterDone } = useTypewriter(
    currentSlide.typeLines,
    55,
    activeIndex,
  );

  // ── Auto-advance ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!typewriterDone || isPaused) return;

    const t = setTimeout(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, SUBTITLE_FADE_MS + LINGER_MS);

    return () => clearTimeout(t);
  }, [typewriterDone, isPaused]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 1 }),
    center: {
      x: "0%",
      opacity: 1,
      transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 1,
      transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] as const },
    }),
  };

  const textStyle = getTextClasses(currentSlide.textPosition);
  const wrapClass = currentSlide.noWrap ? "whitespace-nowrap" : "";

  // ── Dynamic line splitting based on typeLines count ───────────────────────
  const hasTwoLines = currentSlide.typeLines.length === 2;

  const headingLines = hasTwoLines
    ? [displayedLines[0]]
    : [displayedLines[0], displayedLines[1]];

  const unicsiLine = hasTwoLines
    ? (displayedLines[1] ?? "")
    : (displayedLines[2] ?? "");

  // Cursor logic: show cursor on the last actively-typing line
  const typingLineIndex = currentSlide.typeLines.findIndex(
    (_, i) =>
      displayedLines[i] !== undefined &&
      displayedLines[i].length > 0 &&
      displayedLines[i].length < currentSlide.typeLines[i].length,
  );

  return (
    <div className="relative w-full min-w-0 overflow-x-clip overflow-y-visible">
      <div
        ref={heroRef}
        className="relative w-full min-w-0 h-[97vh] sm:h-[80vh] md:h-[930px] mx-auto overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ── SLIDING BACKGROUND ── */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${currentSlide.image}')` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/45 pointer-events-none z-10" />
        </div>

        {/* ── HERO TEXT ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${activeIndex}`}
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.55, ease: easeOut, delay: 0.15 }}
            className={`absolute inset-0 z-40 flex items-center pointer-events-none md:-mt-20 
  max-lg:!justify-center max-lg:!px-4 max-lg:!pl-4 max-lg:!pr-4 max-lg:!items-start max-lg:!pt-24
  ${textStyle.outerFlex} ${textStyle.padding}`}
          >
            <div
              className={`max-w-xl w-full min-w-0 max-lg:max-w-[min(100%,36rem)] max-lg:!text-center ${textStyle.innerText}`}
            >
              {/* Regular heading lines */}
              {headingLines.map((text, i) => (
                <h1
                  key={i}
                  className={`${currentSlide.line1Class} max-lg:whitespace-normal max-lg:break-words ${wrapClass} text-white mb-1 sm:mb-2 leading-tight tracking-wide min-h-[1.2em]`}
                >
                  {text}
                  <Cursor show={!typewriterDone && typingLineIndex === i} />
                </h1>
              ))}

              {/* "WITH UNICSI" line — typewritten for all slides */}
              <h1
                className={`${currentSlide.line2Class} max-lg:whitespace-normal max-lg:break-words ${wrapClass} text-white mb-4 sm:mb-6 md:mb-8 leading-tight tracking-wide min-h-[1.2em]`}
              >
                {unicsiLine}
                <Cursor
                  show={
                    !typewriterDone &&
                    unicsiLine.length > 0 &&
                    unicsiLine.length < "WITH UNICSI".length
                  }
                />
              </h1>

              {/* Subtitle — per slide paragraph */}
              <motion.p
                key={`subtitle-${activeIndex}`}
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                animate={
                  typewriterDone
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 30, filter: "blur(6px)" }
                }
                transition={{
                  duration: SUBTITLE_FADE_MS / 1000,
                  ease: easeOut,
                }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium leading-relaxed"
              >
                {currentSlide.paragraph}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── NAV DOTS ── */}
        <div
          className="absolute left-0 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-2 bg-white py-2.5 px-1 shadow-lg max-lg:top-[42%] max-lg:gap-1.5 max-lg:py-2 lg:gap-4 lg:py-5 lg:px-[10px]"
          style={{ borderRadius: "0 1rem 1rem 0" }}
        >
          {SLIDES.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative flex items-center justify-center focus:outline-none cursor-pointer"
                style={{ width: 24, height: 24 }}
              >
                {isActive && (
                  <motion.span
                    layoutId="dot-ring"
                    className="absolute rounded-full border-2"
                    style={{
                      borderColor: ACTIVE_COLOR,
                      width: 22,
                      height: 22,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <motion.span
                  animate={{
                    width: isActive ? 11 : 9,
                    height: isActive ? 11 : 9,
                    backgroundColor: isActive
                      ? ACTIVE_COLOR
                      : "rgba(160,160,160,0.65)",
                  }}
                  whileHover={{
                    backgroundColor: isActive ? ACTIVE_COLOR : "#0097b260",
                    scale: 1.25,
                  }}
                  transition={{ duration: 0.22 }}
                  className="rounded-full block cursor-pointer"
                  style={{ position: "relative", zIndex: 1 }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── POPULAR PRODUCTS ── */}
      <AnimatedSection delay={0.1}>
        <PopularProducts isInView={true} />
      </AnimatedSection>
    </div>
  );
};

export default Hero;
