
"use client";

import { Sun, CloudRain } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type WeatherCondition = "Soleado" | "Lluvioso";

export function WeatherWidget() {
    // In a real app, this would come from a weather API
    const [weather, setWeather] = useState<{ temp: number, condition: WeatherCondition }>({ temp: 28, condition: "Soleado" });

    useEffect(() => {
        // Mock toggling between sunny and rainy for demonstration
        const interval = setInterval(() => {
            setWeather(prev => ({
                ...prev,
                condition: prev.condition === "Soleado" ? "Lluvioso" : "Soleado"
            }));
        }, 10000); // Switch every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const isSunny = weather.condition === "Soleado";

    return (
        <div className="flex items-center gap-3 bg-gray-900/50 border border-white/10 rounded-lg p-2 px-3 text-white">
            <div className="relative w-8 h-8">
                {/* Sun Icon */}
                <Sun className={cn(
                    "w-8 h-8 text-yellow-400 transition-all duration-500 ease-in-out",
                    isSunny ? "scale-100 opacity-100 animate-sun-spin" : "scale-0 opacity-0"
                )} />
                
                {/* Rain Icon */}
                <div className={cn(
                    "absolute inset-0 transition-all duration-500 ease-in-out",
                    !isSunny ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}>
                    <CloudRain className="w-8 h-8 text-blue-300" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-full h-12">
                        <div className="absolute w-px h-4 bg-blue-300 animate-rain-drop" style={{ left: '20%', animationDelay: '0s' }}></div>
                        <div className="absolute w-px h-3 bg-blue-300 animate-rain-drop" style={{ left: '50%', animationDelay: '0.3s' }}></div>
                        <div className="absolute w-px h-4 bg-blue-300 animate-rain-drop" style={{ left: '80%', animationDelay: '0.6s' }}></div>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-xl">{weather.temp}°C</p>
                <p className="text-xs text-gray-300 -mt-1">{weather.condition}</p>
            </div>
        </div>
    );
}
