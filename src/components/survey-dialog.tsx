
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StarRating = ({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-8 h-8 cursor-pointer transition-colors",
            (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
};

const YesNoButtons = ({ value, setValue }: { value: string | null, setValue: (value: string) => void }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={value === 'si' ? 'default' : 'outline'}
        onClick={() => setValue('si')}
      >
        Sí
      </Button>
      <Button
        variant={value === 'no' ? 'default' : 'outline'}
        onClick={() => setValue('no')}
      >
        No
      </Button>
    </div>
  );
};


export function SurveyDialog({ open, onOpenChange }: SurveyDialogProps) {
  const [step, setStep] = useState(1);
  const [arrivedOnTime, setArrivedOnTime] = useState<string | null>(null);
  const [appQuality, setAppQuality] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<string | null>(null);

  const handleSubmit = () => {
    // Here you would typically send the data to a server
    console.log({ arrivedOnTime, appQuality, wouldRecommend });
    setStep(2); // Move to thank you step
  };

  const handleClose = () => {
     onOpenChange(false);
     // Reset state after a delay to allow for fade-out animation
     setTimeout(() => {
        setStep(1);
        setArrivedOnTime(null);
        setAppQuality(0);
        setWouldRecommend(null);
     }, 300);
  }

  const isSubmitDisabled = !arrivedOnTime || appQuality === 0 || !wouldRecommend;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Encuesta Rápida de Satisfacción</DialogTitle>
              <DialogDescription className="text-center">
                Tu opinión es importante para nosotros.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="on-time" className="text-base font-semibold">¿El bus llegó a tiempo?</Label>
                <YesNoButtons value={arrivedOnTime} setValue={setArrivedOnTime} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="quality" className="text-base font-semibold">Calidad de la app</Label>
                <StarRating rating={appQuality} setRating={setAppQuality} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="recommend" className="text-base font-semibold">¿Recomendarías esta app a tus compañeros?</Label>
                <YesNoButtons value={wouldRecommend} setValue={setWouldRecommend} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full">
                Enviar Encuesta
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
             <ThumbsUp className="w-16 h-16 text-green-500" />
             <h2 className="text-2xl font-bold">¡Muchas gracias!</h2>
             <p className="text-muted-foreground">
                Apreciamos tu tiempo y apoyo a esta iniciativa de la Dirección de Tecnología y Comunicaciones del CESAC.
             </p>
             <Button onClick={handleClose} className="mt-4">Cerrar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
