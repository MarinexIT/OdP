"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { lengths, colors, carabiners, colorHexMap, carabinerHexMap, maskSources } from "@/data/products";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCartStore } from "@/store/cart";
import { useRouter } from "@/i18n/routing";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type ConfigState = {
  lengthId: string;
  colorMode: 1 | 2;
  colors: [string, string?];
  activeColorSlot: 0 | 1;
  carabinerId: string;
};

export default function ProductConfigurator() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [state, setState] = useState<ConfigState>({
    lengthId: lengths[0].id,
    colorMode: 1,
    colors: [colors[0].file],
    activeColorSlot: 0,
    carabinerId: carabiners[0].id,
  });

  const [activeStep, setActiveStep] = useState<"length" | "colors" | "carabiners">("length");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [masksReady, setMasksReady] = useState(false);
  
  const maskImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const maskCanvasesRef = useRef<Record<string, HTMLCanvasElement>>({});
  const primaryOverlayRef = useRef<HTMLDivElement>(null);
  const secondaryOverlayRef = useRef<HTMLDivElement>(null);
  const hardwareOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMask = (key: string, src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.src = src;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          maskImagesRef.current[key] = img;
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          maskCanvasesRef.current[key] = canvas;
          resolve();
        };
        img.onerror = reject;
      });
    };

    Promise.all([
      loadMask("primary", maskSources.primary),
      loadMask("secondary", maskSources.secondary),
      loadMask("hardware", maskSources.hardware),
    ])
      .then(() => setMasksReady(true))
      .catch((err) => console.error("Failed to load masks", err));
  }, []);

  useEffect(() => {
    if (!masksReady) return;

    const tintOverlay = (key: string, hex: string, targetEl: HTMLDivElement | null, opacity = 1) => {
      if (!targetEl || !maskImagesRef.current[key]) return;

      const canvas = maskCanvasesRef.current[key];
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const img = maskImagesRef.current[key];

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = hex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      targetEl.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
      targetEl.style.opacity = opacity.toString();
    };

    const primaryHex = colorHexMap[state.colors[0]] || "#d9d9d9";
    tintOverlay("primary", primaryHex, primaryOverlayRef.current, 0.9);

    if (state.colorMode === 2 && state.colors[1]) {
      const secondaryHex = colorHexMap[state.colors[1]!] || "#d9d9d9";
      tintOverlay("secondary", secondaryHex, secondaryOverlayRef.current, 0.75);
    } else {
       tintOverlay("secondary", primaryHex, secondaryOverlayRef.current, 0.75);
    }

    const carabinerHex = carabinerHexMap[state.carabinerId] || "#d9d9d9";
    tintOverlay("hardware", carabinerHex, hardwareOverlayRef.current, 0.85);

  }, [state, masksReady]);

  const formatPrice = (val: number) => 
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);

  const currentLength = lengths.find(l => l.id === state.lengthId)!;
  const currentCarabiner = carabiners.find(c => c.id === state.carabinerId)!;
  const colorExtra = state.colorMode === 2 ? 5 : 0;
  const totalPrice = currentLength.price + currentCarabiner.price + colorExtra;

  // Show price diff (e.g. +5 EUR)
  const getLengthDiff = (price: number) => {
      const diff = price - lengths[0].price;
      return diff > 0 ? `(+${formatPrice(diff)})` : "";
  };

  const handleColorSelect = (file: string) => {
    let newColors: [string, string?] = [...state.colors];
    if (state.colorMode === 1) {
      newColors = [file];
    } else {
      newColors[state.activeColorSlot] = file;
    }
    setState(prev => ({ ...prev, colors: newColors }));
    setShowColorPicker(false);
  };

  const handleAddToCart = () => {
    const description = `${currentLength.label}, ${colors.find(c => c.file === state.colors[0])?.name}${state.colorMode === 2 ? ` + ${colors.find(c => c.file === state.colors[1])?.name}` : ''}, ${currentCarabiner.name}`;
    
    let previewImage = `/kolory/${state.colors[0]}`;
    
    if (masksReady && maskCanvasesRef.current['primary']) {
        try {
            const width = maskCanvasesRef.current['primary'].width;
            const height = maskCanvasesRef.current['primary'].height;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                const layers = ['primary', 'secondary', 'hardware'];
                layers.forEach(layer => {
                    const layerCanvas = maskCanvasesRef.current[layer];
                    if (layerCanvas) ctx.drawImage(layerCanvas, 0, 0);
                });
                previewImage = canvas.toDataURL('image/png', 0.8);
            }
        } catch (e) {
            console.error("Preview gen error:", e);
        }
    }

    addItem({
      name: "Smycz przepinana wodoodporna 20mm",
      config: {
        lengthId: state.lengthId,
        colors: state.colors as string[],
        carabinerId: state.carabinerId,
        description,
      },
      price: totalPrice,
      quantity: 1,
      image: previewImage
    });
    router.push('/cart'); 
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto p-4 lg:p-8">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-6 sticky top-24 h-fit">
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-xl">
             <Image src="/zdjecia/smycz.jpg" alt="Smycz bazowa" fill className="object-cover z-0" priority />
             <div ref={primaryOverlayRef} className="absolute inset-0 z-10 transition-opacity duration-300 bg-no-repeat bg-contain" />
             <div ref={secondaryOverlayRef} className="absolute inset-0 z-20 transition-opacity duration-300 bg-no-repeat bg-contain" />
             <div ref={hardwareOverlayRef} className="absolute inset-0 z-30 transition-opacity duration-300 bg-no-repeat bg-contain" />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-md">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Taśma</span>
                <div className="flex gap-3 mt-3 justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-200">
                             <img src={`/kolory/${state.colors[0]}`} alt="Kolor" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    {state.colorMode === 2 && (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-200">
                                <img src={`/kolory/${state.colors[1]}`} alt="Kolor 2" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>
             </div>

             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-md">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Karabinek</span>
                <div className="flex items-center justify-center gap-3 mt-2">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                         <img src={`/karabinki/${currentCarabiner.file}`} alt="Karabinek" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{currentCarabiner.name}</span>
                </div>
             </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-4">
        
        {/* Length */}
        <div className={cn("bg-white rounded-2xl shadow-sm border transition-all overflow-hidden", activeStep === "length" ? "border-primary ring-2 ring-primary/10" : "border-gray-200")}>
            <button onClick={() => setActiveStep("length")} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                    <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", activeStep === "length" ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>1</span>
                    <span className="font-bold text-lg text-gray-900">Długość smyczy</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">{currentLength.label}</span>
                    <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", activeStep === "length" && "rotate-180")} />
                </div>
            </button>
            
            {activeStep === "length" && (
                <div className="p-5 pt-0 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 gap-3">
                        {lengths.map(len => (
                            <label key={len.id} className={cn("cursor-pointer relative border-2 rounded-xl p-4 flex items-center justify-between transition-all hover:border-primary/50", state.lengthId === len.id ? "border-primary bg-primary/5" : "border-gray-100 bg-white")}>
                                <input type="radio" name="length" className="hidden" checked={state.lengthId === len.id} onChange={() => setState(prev => ({ ...prev, lengthId: len.id }))} />
                                <div>
                                    <span className="font-bold text-gray-900 block">{len.label}</span>
                                    <span className="text-sm text-gray-500">{len.description}</span>
                                </div>
                                <span className="font-bold text-primary">{getLengthDiff(len.price)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Colors */}
        <div className={cn("bg-white rounded-2xl shadow-sm border transition-all overflow-hidden", activeStep === "colors" ? "border-primary ring-2 ring-primary/10" : "border-gray-200")}>
            <button onClick={() => setActiveStep("colors")} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                    <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", activeStep === "colors" ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>2</span>
                    <span className="font-bold text-lg text-gray-900">Kolory taśmy</span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", activeStep === "colors" && "rotate-180")} />
            </button>

            {activeStep === "colors" && (
                <div className="p-5 pt-0">
                     <div className="flex gap-3 p-1 bg-gray-100 rounded-xl mb-6">
                         {[1, 2].map(mode => (
                             <button
                                key={mode}
                                onClick={() => setState(s => ({...s, colorMode: mode as 1|2, activeColorSlot: mode === 1 ? 0 : 1}))}
                                className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", state.colorMode === mode ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                             >
                                 {mode} Kolor {mode === 2 && "(+5 €)"}
                             </button>
                         ))}
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <button 
                            onClick={() => { setState(s => ({...s, activeColorSlot: 0})); setShowColorPicker(true); }}
                            className={cn("relative p-4 rounded-xl border-2 text-left transition-all group", state.activeColorSlot === 0 && showColorPicker ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30")}
                         >
                             <span className="text-xs font-bold uppercase text-gray-400 mb-2 block">Kolor Główny</span>
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                                     <img src={`/kolory/${state.colors[0]}`} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-sm font-bold text-gray-900 line-clamp-2">{colors.find(c => c.file === state.colors[0])?.name}</span>
                             </div>
                         </button>

                         <button 
                            disabled={state.colorMode === 1}
                            onClick={() => { setState(s => ({...s, activeColorSlot: 1})); setShowColorPicker(true); }}
                            className={cn("relative p-4 rounded-xl border-2 text-left transition-all", 
                                state.colorMode === 1 ? "opacity-40 cursor-not-allowed border-dashed" : (state.activeColorSlot === 1 && showColorPicker ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30")
                            )}
                         >
                             <span className="text-xs font-bold uppercase text-gray-400 mb-2 block">Kolor Dodatkowy</span>
                             {state.colorMode === 2 ? (
                                <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                                     {state.colors[1] ? <img src={`/kolory/${state.colors[1]}`} className="w-full h-full object-cover" /> : <div className="bg-gray-100 w-full h-full" />}
                                 </div>
                                 <span className="text-sm font-bold text-gray-900 line-clamp-2">{state.colors[1] ? colors.find(c => c.file === state.colors[1])?.name : "Wybierz"}</span>
                                </div>
                             ) : (
                                <span className="text-sm font-medium text-gray-400 mt-2 block">Niedostępny</span>
                             )}
                         </button>
                     </div>

                     {showColorPicker && (
                         <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                             <div className="flex items-center justify-between mb-4">
                                 <h3 className="font-bold text-gray-900">Wybierz {state.activeColorSlot === 0 ? "kolor główny" : "kolor dodatkowy"}</h3>
                                 <button onClick={() => setShowColorPicker(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                             </div>
                             <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                                 {colors.map(color => (
                                     <button 
                                        key={color.file}
                                        onClick={() => handleColorSelect(color.file)}
                                        className="group relative aspect-square rounded-lg overflow-hidden ring-offset-2 hover:ring-2 hover:ring-primary focus:outline-none transition-all"
                                        title={color.name}
                                     >
                                         <img src={`/kolory/${color.file}`} className="w-full h-full object-cover" />
                                         {(state.colors[state.activeColorSlot] === color.file) && (
                                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                 <Check className="w-6 h-6 text-white" />
                                             </div>
                                         )}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     )}
                </div>
            )}
        </div>

        {/* Carabiners */}
        <div className={cn("bg-white rounded-2xl shadow-sm border transition-all overflow-hidden", activeStep === "carabiners" ? "border-primary ring-2 ring-primary/10" : "border-gray-200")}>
            <button onClick={() => setActiveStep("carabiners")} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                    <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", activeStep === "carabiners" ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>3</span>
                    <span className="font-bold text-lg text-gray-900">Karabinki</span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", activeStep === "carabiners" && "rotate-180")} />
            </button>

            {activeStep === "carabiners" && (
                <div className="p-5 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {carabiners.map(carb => (
                             <button
                                key={carb.id}
                                onClick={() => setState(s => ({...s, carabinerId: carb.id}))}
                                className={cn("relative flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:border-primary/50 bg-white",
                                    state.carabinerId === carb.id ? "border-primary bg-primary/5" : "border-gray-100"
                                )}
                             >
                                 <div className="w-16 h-16 mb-3">
                                     <img src={`/karabinki/${carb.file}`} className="w-full h-full object-contain mix-blend-multiply" />
                                 </div>
                                 <span className="text-sm font-bold text-gray-900">{carb.name}</span>
                                 <span className="text-xs font-medium text-primary mt-1">{carb.price === 0 ? "w cenie" : `+${formatPrice(carb.price)}`}</span>
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Summary Footer */}
        <div className="sticky bottom-4 z-40 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-gray-200 mt-4">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Do zapłaty</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{formatPrice(totalPrice)}</p>
                </div>
                <button 
                    onClick={handleAddToCart}
                    className="bg-primary hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-primary/30 transform hover:scale-105 active:scale-95"
                >
                    Dodaj do koszyka
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
