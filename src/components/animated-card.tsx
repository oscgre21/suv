
"use client";

import React, { useRef, useState, MouseEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    glowClassName?: string;
    href?: string;
}

export function AnimatedCard({ children, className, glowClassName, href }: AnimatedCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});

    const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const rotateX = (y / height - 0.5) * -15;
        const rotateY = (x / width - 0.5) * 15;
        
        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
            '--glow-x': `${x}px`,
            '--glow-y': `${y}px`,
        });
    };

    const onMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        });
    };

    const cardContent = (
        <div
            ref={cardRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={style as React.CSSProperties}
            className={cn("animated-card relative h-full w-full rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-out hover:shadow-2xl", className)}
        >
            <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-br opacity-30", glowClassName)}></div>
            <div className="card-glow absolute inset-0 rounded-xl"></div>
            
            <div className="relative flex h-full flex-col">
                {children}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full w-full [transform-style:preserve-3d]">
                {cardContent}
            </Link>
        );
    }

    return (
         <div className="block h-full w-full [transform-style:preserve-3d]">
            {cardContent}
        </div>
    );
}
