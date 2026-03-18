"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const KINNECT_SIGNUP_URL =
  "https://um.kinnect.club/signup?redirect_uri=https%3A%2F%2Fapp.kinnect.club%2Fauth%2Fcallback&product=kinnect";

// Use the bundled pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  linkId: string;
  deck: { title: string; fileUrl: string; slideCount: number };
  viewerEmail?: string;
  viewerName?: string;
}

const HEARTBEAT_INTERVAL_MS = 5_000;

export function DeckViewer({ linkId, deck, viewerEmail, viewerName }: Props) {
  const [viewId, setViewId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(deck.slideCount || 0);
  const [started, setStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Track seconds on current slide
  const slideStartRef = useRef<number>(Date.now());
  const secondsOnSlideRef = useRef<number>(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start a session on mount
  useEffect(() => {
    async function startSession() {
      const res = await fetch("/api/track/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, viewerEmail, viewerName }),
      });
      if (res.ok) {
        const data = await res.json();
        setViewId(data.viewId);
        if (data.slideCount) setTotalSlides(data.slideCount);
        setStarted(true);
      }
    }
    startSession();
  }, [linkId, viewerEmail, viewerName]);

  const sendHeartbeat = useCallback(
    async (slide: number, seconds: number, id: string) => {
      await fetch("/api/track/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewId: id, slideIndex: slide, secondsOnSlide: seconds }),
      });
    },
    []
  );

  // Heartbeat every 5s
  useEffect(() => {
    if (!viewId || !started) return;
    slideStartRef.current = Date.now();
    secondsOnSlideRef.current = 0;

    heartbeatRef.current = setInterval(() => {
      const elapsed = Math.round((Date.now() - slideStartRef.current) / 1000);
      secondsOnSlideRef.current = elapsed;
      sendHeartbeat(currentSlide, elapsed, viewId);
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [viewId, currentSlide, started, sendHeartbeat]);

  async function goToSlide(next: number) {
    if (!viewId) return;
    // Final heartbeat for current slide
    const elapsed = Math.round((Date.now() - slideStartRef.current) / 1000);
    await sendHeartbeat(currentSlide, elapsed, viewId);

    // Notify slide change
    await fetch("/api/track/slide-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewId, slideIndex: next }),
    });

    setCurrentSlide(next);
    slideStartRef.current = Date.now();

    // Mark complete if reaching the last slide, then show Kinnect CTA
    if (next === totalSlides) {
      await fetch("/api/track/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewId }),
      });
      // Small delay so the last slide renders before the overlay appears
      setTimeout(() => setShowCompletion(true), 1200);
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setTotalSlides(numPages);
  }

  const progress = totalSlides > 0 ? (currentSlide / totalSlides) * 100 : 0;

  return (
    <div className="relative min-h-screen bg-brand flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-xl font-bold text-white tracking-tight">
          kinnect<span className="text-brand-accent">.</span>
        </span>
        <span className="text-sm text-white/50 truncate max-w-xs">{deck.title}</span>
        <span className="text-sm text-white/50">
          {currentSlide} / {totalSlides}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10">
        <div
          className="h-full bg-brand-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide viewer */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-4xl shadow-2xl rounded-lg overflow-hidden bg-white">
          <Document
            file={deck.fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="aspect-video flex items-center justify-center bg-white">
                <span className="text-gray-400 text-sm">Loading deck…</span>
              </div>
            }
          >
            <Page
              pageNumber={currentSlide}
              width={Math.min(typeof window !== "undefined" ? window.innerWidth - 64 : 900, 900)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {/* Completion overlay — Kinnect signup CTA */}
      {showCompletion && (
        <div className="absolute inset-0 z-50 bg-brand/95 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-brand-accent/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-brand-accent" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Kinnect is built for families.
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                We&apos;re making it easy for families to stay connected, share
                memories, and grow together — privately and beautifully.
                Join thousands of families already on Kinnect.
              </p>
            </div>
            <div className="space-y-3">
              <a
                href={KINNECT_SIGNUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md bg-brand-accent text-white font-medium text-sm hover:bg-brand-accent/90 transition-colors"
              >
                Join Kinnect — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={() => setShowCompletion(false)}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Back to deck
              </button>
            </div>
            <p className="text-xs text-white/30">
              You&apos;ve seen what we&apos;re building. Come be part of it.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 py-5 border-t border-white/10">
        <Button
          variant="ghost"
          size="icon"
          disabled={currentSlide <= 1}
          onClick={() => goToSlide(currentSlide - 1)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Slide dots (up to 20, then show numbers) */}
        {totalSlides <= 20 ? (
          <div className="flex gap-1.5">
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i + 1)}
                className={`h-1.5 rounded-full transition-all ${
                  i + 1 === currentSlide
                    ? "w-6 bg-brand-accent"
                    : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        ) : (
          <span className="text-white/50 text-sm">
            Slide {currentSlide} of {totalSlides}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          disabled={currentSlide >= totalSlides}
          onClick={() => goToSlide(currentSlide + 1)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
