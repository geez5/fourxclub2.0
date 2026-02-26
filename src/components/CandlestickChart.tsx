'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
    motion, AnimatePresence,
    useScroll, useTransform,
    type MotionValue,
} from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candle {
    id: number;
    open: number;
    close: number;
    high: number;
    low: number;
    isBullish: boolean;
}

interface ScatterOffset {
    x: number;
    y: number;
    rotate: number;
    scale: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = '#6BBF6A';
const PURPLE = '#9B7BD3';
const VISIBLE = 80;
const CANDLE_W = 10;
const CANDLE_GAP = 4;
const TOTAL_CW = CANDLE_W + CANDLE_GAP;
const SVG_W = VISIBLE * TOTAL_CW;
const SVG_H = 260;

// ─── Data helpers ─────────────────────────────────────────────────────────────

function seededRng(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function generateCandles(count: number): Candle[] {
    const rng = seededRng(42);
    const out: Candle[] = [];
    let price = 1.1050;
    for (let i = 0; i < count; i++) {
        const move = (rng() - 0.48) * 0.002;
        const vol = 0.0005 + rng() * 0.002;
        const open = price;
        const close = price + move;
        const high = Math.max(open, close) + rng() * vol;
        const low = Math.min(open, close) - rng() * vol;
        out.push({ id: i, open, close, high, low, isBullish: close >= open });
        price = close;
    }
    return out;
}

function nextCandle(last: Candle, id: number): Candle {
    const move = (Math.random() - 0.48) * 0.002;
    const vol = 0.0005 + Math.random() * 0.002;
    const open = last.close;
    const close = open + move;
    const high = Math.max(open, close) + Math.random() * vol;
    const low = Math.min(open, close) - Math.random() * vol;
    return { id, open, close, high, low, isBullish: close >= open };
}

// ─── Per-candle scatter offsets (stable across renders) ───────────────────────

function buildScatterOffsets(count: number): ScatterOffset[] {
    return Array.from({ length: count }, (_, i) => {
        // deterministic per-index so they don't re-randomise on re-render
        const rng = seededRng(i * 7919 + 31337);
        return {
            x: (rng() - 0.5) * 900,
            y: (rng() - 0.5) * 700,
            rotate: (rng() - 0.5) * 120,
            scale: 0.05 + rng() * 0.4,
        };
    });
}

const SCATTER_OFFSETS = buildScatterOffsets(VISIBLE + 20);

// ─── Individual candle component (needs its own hook calls) ───────────────────

interface CandleElementProps {
    candle: Candle;
    index: number;
    scatter: MotionValue<number>;   // 0 = assembled, 1 = fully scattered
    toY: (p: number) => number;
    isLast: boolean;
    isHovered: boolean;
}

function CandleElement({ candle, index, scatter, toY, isLast, isHovered }: CandleElementProps) {
    const off = SCATTER_OFFSETS[index] ?? { x: 0, y: 0, rotate: 0, scale: 1 };
    const color = candle.isBullish ? GREEN : PURPLE;

    // Each candle gets its own useTransform for smooth per-element offset
    const tx = useTransform(scatter, [0, 1], [0, off.x]);
    const ty = useTransform(scatter, [0, 1], [0, off.y]);
    const rot = useTransform(scatter, [0, 1], [0, off.rotate]);
    const sc = useTransform(scatter, [0, 1], [1, off.scale]);
    const opacity = useTransform(scatter, [0, 0.3, 0.7, 1], [1, 1, 0.6, 0.1]);

    const x = index * TOTAL_CW;
    const bodyTop = toY(Math.max(candle.open, candle.close));
    const bodyBot = toY(Math.min(candle.open, candle.close));
    const bodyH = Math.max(bodyBot - bodyTop, 1.5);
    const wickTop = toY(candle.high);
    const wickBot = toY(candle.low);

    const cx = x + CANDLE_W / 2;   // candle centre-x for transform origin
    const cy = bodyTop + bodyH / 2; // candle centre-y

    return (
        <motion.g
            style={{
                x: tx,
                y: ty,
                rotate: rot,
                scale: sc,
                opacity,
                originX: cx,
                originY: cy,
            }}
        >
            {/* Wick */}
            <motion.line
                x1={cx} y1={wickTop}
                x2={cx} y2={wickBot}
                stroke={color}
                strokeWidth={isHovered ? 1.5 : 1}
                initial={isLast ? { scaleY: 0 } : false}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ transformOrigin: `${cx}px ${(wickTop + wickBot) / 2}px` }}
            />
            {/* Body */}
            <motion.rect
                x={x} y={bodyTop}
                width={CANDLE_W} height={bodyH}
                fill={`${color}cc`}
                stroke={color}
                strokeWidth={isHovered ? 1.5 : 0.8}
                rx={1}
                initial={isLast ? { scaleY: 0 } : false}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, ease: 'backOut' }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
            {/* Latest candle pulse ring */}
            {isLast && (
                <motion.rect
                    x={x - 2} y={bodyTop - 2}
                    width={CANDLE_W + 4} height={bodyH + 4}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={1}
                    rx={2}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}
        </motion.g>
    );
}

// ─── Main chart component ─────────────────────────────────────────────────────

export default function CandlestickChart() {
    const [candles, setCandles] = useState<Candle[]>(() => generateCandles(VISIBLE + 1));
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStartX = useRef<number | null>(null);
    const nextId = useRef(VISIBLE + 1);

    const containerRef = useRef<HTMLDivElement>(null);

    // ── Scroll-driven scatter ──────────────────────────────────────────────────
    // scrollYProgress: 0 = chart bottom entering viewport, 0.5 = centred, 1 = chart top leaving
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    // scatter = 0 when chart is assembled (centred), rises to 1+ as it exits upward
    // small entrance scatter (0.35) when scrolling down in from below
    const scatter = useTransform(
        scrollYProgress,
        [0, 0.15, 0.45, 0.75, 0.88, 1],
        [0.35, 0, 0, 0.15, 0.7, 1.5],
    );

    // ── Live tick ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const t = setInterval(() => {
            setCandles(prev => {
                const next = nextCandle(prev[prev.length - 1], nextId.current++);
                return [...prev.slice(-VISIBLE - 1), next];
            });
        }, 1600);
        return () => clearInterval(t);
    }, []);

    // ── Derived chart bounds ──────────────────────────────────────────────────
    const visibleCandles = candles.slice(-VISIBLE);
    const highs = visibleCandles.map(c => c.high);
    const lows = visibleCandles.map(c => c.low);
    const chartMax = Math.max(...highs);
    const chartMin = Math.min(...lows);
    const range = chartMax - chartMin || 0.001;

    const toY = (p: number) => ((chartMax - p) / range) * (SVG_H - 16) + 8;

    // ── Drag to pan ────────────────────────────────────────────────────────────
    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || dragStartX.current === null) return;
        setDragOffset((e.clientX - dragStartX.current) * 0.3);
    };
    const onMouseUp = () => {
        setIsDragging(false);
        dragStartX.current = null;
        setDragOffset(0);
    };

    const hoveredCandle = hoveredIdx !== null ? visibleCandles[hoveredIdx] : null;

    return (
        <div
            ref={containerRef}
            className="relative w-full select-none"
            style={{
                background: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(107,191,106,0.18)',
                boxShadow: '0 0 60px 0 rgba(107,191,106,0.08), 0 0 30px 0 rgba(155,123,211,0.06)',
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {/* Live label */}
            <div className="absolute top-2 left-3 flex items-center gap-2 z-10 pointer-events-none">
                <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: GREEN, animation: 'chartPulse 1.6s ease-in-out infinite',
                }} />
                <span style={{ color: GREEN, fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 }}>
                    LIVE · {visibleCandles[visibleCandles.length - 1]?.close.toFixed(4)}
                </span>
            </div>

            {/* SVG body */}
            <div style={{ overflowX: 'hidden', width: '100%' }}>
                <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    preserveAspectRatio="none"
                    style={{
                        width: '100%',
                        height: SVG_H,
                        display: 'block',
                        transform: `translateX(${dragOffset}px)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease',
                        overflow: 'visible',
                    }}
                    onMouseMove={e => {
                        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                        const idx = Math.floor(((e.clientX - rect.left) / rect.width) * VISIBLE);
                        setHoveredIdx(Math.max(0, Math.min(VISIBLE - 1, idx)));
                    }}
                    onMouseLeave={() => setHoveredIdx(null)}
                >
                    {/* Grid */}
                    {[0.2, 0.4, 0.6, 0.8].map(f => (
                        <line key={f} x1={0} y1={f * SVG_H} x2={SVG_W} y2={f * SVG_H}
                            stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                    ))}

                    {/* Hover crosshair */}
                    {hoveredIdx !== null && (
                        <line
                            x1={hoveredIdx * TOTAL_CW + CANDLE_W / 2} y1={0}
                            x2={hoveredIdx * TOTAL_CW + CANDLE_W / 2} y2={SVG_H}
                            stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 4"
                        />
                    )}

                    {/* Candles — each gets its own motion */}
                    {visibleCandles.map((candle, i) => (
                        <CandleElement
                            key={candle.id}
                            candle={candle}
                            index={i}
                            scatter={scatter}
                            toY={toY}
                            isLast={i === visibleCandles.length - 1}
                            isHovered={hoveredIdx === i}
                        />
                    ))}
                </svg>
            </div>

            {/* OHLC Tooltip */}
            <AnimatePresence>
                {hoveredCandle && hoveredIdx !== null && (
                    <motion.div
                        key={hoveredIdx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            bottom: 8,
                            left: `${(hoveredIdx / VISIBLE) * 100}%`,
                            transform: 'translateX(-50%)',
                            background: 'rgba(10,10,10,0.92)',
                            border: `1px solid ${hoveredCandle.isBullish ? GREEN : PURPLE}40`,
                            borderRadius: 8,
                            padding: '6px 10px',
                            pointerEvents: 'none',
                            zIndex: 20,
                            minWidth: 120,
                            boxShadow: `0 0 16px ${hoveredCandle.isBullish ? GREEN : PURPLE}20`,
                        }}
                    >
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {(['O', 'H', 'L', 'C'] as const).map((label, li) => {
                                const vals = [hoveredCandle.open, hoveredCandle.high, hoveredCandle.low, hoveredCandle.close];
                                return (
                                    <span key={label} style={{ fontSize: 10, fontFamily: 'monospace', color: hoveredCandle.isBullish ? GREEN : PURPLE }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}: </span>
                                        {vals[li].toFixed(4)}
                                    </span>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Time axis */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px 6px', opacity: 0.3 }}>
                {[0, 20, 40, 60, 79].map(i => (
                    <span key={i} style={{ fontSize: 9, fontFamily: 'monospace', color: '#fff' }}>-{VISIBLE - i}</span>
                ))}
            </div>

            <style>{`
        @keyframes chartPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px ${GREEN}; }
          50%       { opacity: 0.5; box-shadow: 0 0 16px ${GREEN}; }
        }
      `}</style>
        </div>
    );
}
