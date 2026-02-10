import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export const Icons = {
  logo: ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "font-headline font-black tracking-widest text-primary-foreground text-6xl"
        )}
      >
        S.U.V
      </div>
      <p className="mt-2 text-sm font-medium text-primary-foreground/80 tracking-tight">
        Sistema de Ubicación Vehicular
      </p>
    </div>
  ),
};
