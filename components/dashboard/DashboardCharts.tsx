"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Clock, RotateCw } from "lucide-react";

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  className?: string;
}

export function DonutChart({ data, title, className }: DonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = 0;

  return (
    <div className={cn("premium-card flex flex-col gap-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-display font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Distribution across categories</p>
        </div>
        <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all text-slate-400 hover:text-primary group">
          <RotateCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-around gap-12 pt-4">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            {data.map((item, i) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -currentAngle;
              currentAngle += percentage;

              return (
                <motion.circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={100}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">{total}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Total Items</span>
          </div>
        </div>

        <div className="flex flex-col gap-y-4 w-full px-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-default">
              <div 
                className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-transparent group-hover:ring-slate-100 transition-all" 
                style={{ backgroundColor: item.color }} 
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {total > 0 ? Math.round((item.value / total) * 100) : 0}% • {item.value} units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; maxValue: number }[];
  title: string;
  className?: string;
}

export function BarChart({ data, title, className }: BarChartProps) {
  return (
    <div className={cn("premium-card flex flex-col gap-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-display font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Weekly performance metrics</p>
        </div>
        <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all text-slate-400 hover:text-primary group">
          <RotateCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
      <div className="flex items-end justify-between gap-4 h-48 sm:h-56 pt-8">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-4 flex-1 group">
            <div className="relative w-full flex-1 flex flex-col justify-end bg-slate-50/50 dark:bg-slate-900/30 rounded-xl overflow-hidden">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / item.maxValue) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                className="w-full bg-[#2563EB] rounded-t-lg relative"
              >
                {/* Glossy overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none">
                  {item.value}
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; current: number; previous: number; date?: string }[];
  title: string;
  maxValue: number;
  className?: string;
  subtitle?: string;
}

export function LineChart({ data, title, maxValue, className, subtitle }: LineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const paddingX = 10;
  const paddingY = 15;
  const chartWidth = 100 - (paddingX * 2);
  const chartHeight = 100 - (paddingY * 2);

  const points = useMemo(() => data.map((d, i) => ({
    x: paddingX + (i / (data.length - 1)) * chartWidth,
    currY: paddingY + (chartHeight - (d.current / maxValue) * chartHeight),
    prevY: paddingY + (chartHeight - (d.previous / maxValue) * chartHeight),
    data: d
  })), [data, maxValue, chartWidth, chartHeight]);

  const getSmoothPath = (pts: {x: number, y: number}[]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const currentPath = getSmoothPath(points.map(p => ({ x: p.x, y: p.currY })));
  const previousPath = getSmoothPath(points.map(p => ({ x: p.x, y: p.prevY })));
  const areaPath = currentPath + ` L ${points[points.length - 1].x},100 L ${points[0].x},100 Z`;

  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];
  const trend = lastPoint.current - firstPoint.current;
  const trendPct = Math.round((trend / firstPoint.current) * 100);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Find closest point index
    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((p, i) => {
      const diff = Math.abs(p.x - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    if (minDiff < chartWidth / (data.length * 1.5)) {
      setHoverIndex(closestIndex);
    } else {
      setHoverIndex(null);
    }
  };

  return (
    <div 
      className={cn("premium-card flex flex-col gap-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIndex(null)}
      ref={containerRef}
    >
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xl font-display font-bold text-foreground leading-tight">{title}</h3>
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
            trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trendPct)}%
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
          <Clock size={10} />
          <span>Updated 2 hrs ago</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Active</span>
        </div>
        <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-default">
          <div className="w-2 h-2 rounded-full border border-slate-400 bg-transparent" />
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest hidden sm:inline">Prev</span>
        </div>
      </div>

      <div className="relative h-48 sm:h-64 w-full group/chart mt-8">
      {/* Y-Axis Labels - Moved inside to prevent overflow */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-[10%] pointer-events-none z-10 px-1">
        {[100, 50, 0].map(v => (
          <span key={v} className="text-[9px] font-bold text-slate-400/50 dark:text-slate-500 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] px-1 rounded">
            {v}
          </span>
        ))}
      </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="premium-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines - Horizontal Only */}
          {[0, 25, 50, 75, 100].map(y => {
            const yPos = paddingY + (chartHeight - (y / 100) * chartHeight);
            return (
              <line key={y} x1={paddingX} y1={yPos} x2={100 - paddingX} y2={yPos} stroke="#F1F5F9" strokeWidth="1" />
            );
          })}

          {/* Tracking line */}
          <AnimatePresence>
            {hoverIndex !== null && (
              <motion.line
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                x1={points[hoverIndex].x}
                y1={paddingY}
                x2={points[hoverIndex].x}
                y2={paddingY + chartHeight}
                stroke="#2563EB"
                strokeWidth="1"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </AnimatePresence>

          {/* Previous Path - Muted */}
          <motion.path
            d={previousPath}
            fill="transparent"
            stroke="#94A3B8"
            strokeOpacity="0.15"
            strokeWidth="2"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Area Fill */}
          <motion.path
            d={areaPath}
            fill="url(#premium-gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Current Path - Dominant */}
          <motion.path
            d={currentPath}
            fill="transparent"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Data points - Interactive */}
          {points.map((p, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g key={i}>
                <motion.circle
                  cx={p.x}
                  cy={p.currY}
                  r={isHovered ? 6 : 3}
                  fill="white"
                  stroke="#2563EB"
                  strokeWidth={isHovered ? 3 : 2}
                  vectorEffect="non-scaling-stroke"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  style={{ filter: isHovered ? 'drop-shadow(0 0 4px rgba(37,99,235,0.3))' : 'none' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoverIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl p-3 z-10 pointer-events-none"
              style={{ 
                left: `${points[hoverIndex].x}%`, 
                top: `${points[hoverIndex].currY}%`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              <div className="flex flex-col gap-1 min-w-[80px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {points[hoverIndex].data.label} {points[hoverIndex].data.date || ""}
                </span>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-display font-bold text-slate-900 dark:text-white">{points[hoverIndex].data.current}</span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    points[hoverIndex].data.current >= points[hoverIndex].data.previous ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {points[hoverIndex].data.current >= points[hoverIndex].data.previous ? "+" : ""}
                    {Math.round(((points[hoverIndex].data.current - points[hoverIndex].data.previous) / points[hoverIndex].data.previous) * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between w-full px-[10%]">
          {data.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-1 h-3 bg-slate-100 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors hover:text-slate-600 cursor-default">
                {d.label}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center">
          <p className="text-xs text-muted-foreground italic bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-lg">
            "Your AI score increased steadily over the last 3 months."
          </p>
        </div>
      </div>
    </div>
  );
}
