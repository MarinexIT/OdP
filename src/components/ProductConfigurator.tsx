"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { lengths, colors, carabiners, colorHexMap, carabinerHexMap, maskSources } from "@/data/products";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type ConfigState = {
  lengthId: string;
  colorMode: 1 | 2;
  colors: [string, string?]; // fileName
  activeColorSlot: 0 | 1;
  carabinerId: string;
};

import { useCartStore } from "@/store/cart";
import { useRouter } from "@/i18n/routing"; // Używamy routera z obsługą i18n

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
  
  // Refs for canvas and images
  const maskImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const maskCanvasesRef = useRef<Record<string, HTMLCanvasElement>>({});
  const primaryOverlayRef = useRef<HTMLDivElement>(null);
  const secondaryOverlayRef = useRef<HTMLDivElement>(null);
  const hardwareOverlayRef = useRef<HTMLDivElement>(null);

  // Load masks
  useEffect(() => {
    const loadMask = (key: string, src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.src = src;
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

  // Tint logic
  useEffect(() => {
    if (!masksReady) return;

    const tintOverlay = (key: string, hex: string, targetEl: HTMLDivElement | null, opacity = 1) => {
      if (!targetEl || !maskImagesRef.current[key]) return;

      const canvas = maskCanvasesRef.current[key];
      const ctx = canvas.getContext("2d");
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
       // Single color mode logic: use primary color for secondary layer too?
       // Original script: tintOverlay("secondary", primaryHex, secondaryOverlayEl, 0.75);
       tintOverlay("secondary", primaryHex, secondaryOverlayRef.current, 0.75);
    }

    const carabinerHex = carabinerHexMap[state.carabinerId] || "#d9d9d9";
    tintOverlay("hardware", carabinerHex, hardwareOverlayRef.current, 0.85);

  }, [state, masksReady]);


  // Helper functions
  const formatPrice = (val: number) => 
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);

  const currentLength = lengths.find(l => l.id === state.lengthId)!;
  const currentCarabiner = carabiners.find(c => c.id === state.carabinerId)!;
  const colorExtra = state.colorMode === 2 ? 5 : 0;
  const totalPrice = currentLength.price + currentCarabiner.price + colorExtra;

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
    
    // Generowanie podglądu
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
                // Opcjonalnie tło
                // ctx.fillStyle = "#ffffff";
                // ctx.fillRect(0, 0, width, height);

                // Rysujemy warstwy
                const layers = ['primary', 'secondary', 'hardware'];
                layers.forEach(layer => {
                    const layerCanvas = maskCanvasesRef.current[layer];
                    if (layerCanvas) {
                         ctx.drawImage(layerCanvas, 0, 0);
                    }
                });
                
                previewImage = canvas.toDataURL('image/png', 0.8);
            }
        } catch (e) {
            console.error("Błąd generowania podglądu canvas:", e);
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
      {/* LEFT COLUMN: PREVIEW */}
      <div className="flex flex-col gap-6">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
             {/* Base Image */}
             <Image 
               src="/zdjecia/smycz.jpg" 
               alt="Smycz bazowa"
               fill
               className="object-cover z-0"
               priority
             />
             
             {/* Overlays */}
             <div ref={primaryOverlayRef} className="absolute inset-0 z-10 transition-opacity duration-300 bg-no-repeat bg-contain" />
             <div ref={secondaryOverlayRef} className="absolute inset-0 z-20 transition-opacity duration-300 bg-no-repeat bg-contain" />
             <div ref={hardwareOverlayRef} className="absolute inset-0 z-30 transition-opacity duration-300 bg-no-repeat bg-contain" />
        </div>

        {/* Small Previews */}
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Taśma</span>
                <div className="flex gap-2 mt-2">
                    {/* Primary Color */}
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                             <img src={`/kolory/${state.colors[0]}`} alt="Kolor" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] mt-1 text-center leading-tight truncate w-16">
                            {colors.find(c => c.file === state.colors[0])?.name}
                        </span>
                    </div>
                    {/* Secondary Color */}
                    <div className={cn("flex flex-col items-center transition-opacity", state.colorMode === 1 && "opacity-30 grayscale")}>
                         <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                             {state.colorMode === 2 && state.colors[1] ? (
                                <img src={`/kolory/${state.colors[1]}`} alt="Kolor 2" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">2</div>
                             )}
                        </div>
                        <span className="text-[10px] mt-1 text-center leading-tight truncate w-16">
                            {state.colorMode === 2 && state.colors[1] ? colors.find(c => c.file === state.colors[1])?.name : "(brak)"}
                        </span>
                    </div>
                </div>
             </div>

             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Karabinek</span>
                <div className="flex items-center gap-3 mt-2">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                         <img src={`/karabinki/${currentCarabiner.file}`} alt="Karabinek" className="max-w-full max-h-full p-1" />
                    </div>
                    <div className="text-xs">
                        <p className="font-semibold">{currentCarabiner.name}</p>
                        <p className="text-gray-500">{currentCarabiner.price > 0 ? `+${formatPrice(currentCarabiner.price)}` : "w cenie"}</p>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CONFIGURATION */}
      <div className="flex flex-col gap-4">
        
        {/* Step 1: Length */}
        <div className={cn("border rounded-xl transition-all", activeStep === "length" ? "border-primary ring-1 ring-primary/20 bg-white" : "border-gray-200 bg-gray-50")}>
            <button onClick={() => setActiveStep("length")} className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", activeStep === "length" ? "bg-primary text-white" : "bg-gray-200 text-gray-600")}>1</span>
                    <span className="font-semibold">Długość smyczy</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 hidden sm:inline">{currentLength.label}</span>
                    {activeStep === "length" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>
            
            {activeStep === "length" && (
                <div className="p-4 pt-0 border-t border-gray-100 animate-in slide-in-from-top-2">
                    <p className="text-sm text-gray-500 mb-4 mt-2">Wariant cenowy – trzy długości z 3 przepięciami.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {lengths.map(len => (
                            <label key={len.id} className={cn("cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition-all hover:border-pink-300", state.lengthId === len.id ? "border-primary bg-pink-50" : "border-gray-100 bg-white")}>
                                <input 
                                    type="radio" 
                                    name="length" 
                                    className="hidden" 
                                    checked={state.lengthId === len.id}
                                    onChange={() => setState(prev => ({ ...prev, lengthId: len.id }))}
                                />
                                <span className="font-bold text-lg">{len.label}</span>
                                <span className="text-xs text-center text-gray-500">{len.description}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Step 2: Colors */}
        <div className={cn("border rounded-xl transition-all", activeStep === "colors" ? "border-primary ring-1 ring-primary/20 bg-white" : "border-gray-200 bg-gray-50")}>
            <button onClick={() => setActiveStep("colors")} className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", activeStep === "colors" ? "bg-primary text-white" : "bg-gray-200 text-gray-600")}>2</span>
                    <span className="font-semibold">Kolory taśmy</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeStep === "colors" && "rotate-180")} />
            </button>

            {activeStep === "colors" && (
                <div className="p-4 pt-0 border-t border-gray-100">
                     <div className="flex gap-4 p-2 bg-gray-100 rounded-lg mb-6 mt-4">
                         <label className="flex-1 cursor-pointer flex items-center gap-2 p-2 rounded bg-white shadow-sm has-[:checked]:ring-2 ring-primary">
                             <input type="radio" name="colorMode" value={1} checked={state.colorMode === 1} onChange={() => setState(s => ({...s, colorMode: 1, activeColorSlot: 0}))} className="accent-primary" />
                             <span className="text-sm font-medium">1 kolor (w cenie)</span>
                         </label>
                         <label className="flex-1 cursor-pointer flex items-center gap-2 p-2 rounded bg-white shadow-sm has-[:checked]:ring-2 ring-primary">
                             <input type="radio" name="colorMode" value={2} checked={state.colorMode === 2} onChange={() => setState(s => ({...s, colorMode: 2, activeColorSlot: 1}))} className="accent-primary" />
                             <span className="text-sm font-medium">2 kolory (+5€)</span>
                         </label>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <button 
                            onClick={() => { setState(s => ({...s, activeColorSlot: 0})); setShowColorPicker(true); }}
                            className={cn("flex flex-col gap-2 p-3 rounded-xl border-2 text-left hover:border-pink-300 transition-all", state.activeColorSlot === 0 && showColorPicker ? "border-primary bg-pink-50" : "border-gray-200")}
                         >
                             <span className="text-xs font-bold uppercase text-gray-500">Kolor Główny</span>
                             <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden">
                                     <img src={`/kolory/${state.colors[0]}`} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-sm truncate font-medium">{colors.find(c => c.file === state.colors[0])?.name}</span>
                             </div>
                         </button>

                         <button 
                            disabled={state.colorMode === 1}
                            onClick={() => { setState(s => ({...s, activeColorSlot: 1})); setShowColorPicker(true); }}
                            className={cn("flex flex-col gap-2 p-3 rounded-xl border-2 text-left transition-all", 
                                state.colorMode === 1 ? "opacity-50 cursor-not-allowed border-dashed" : "hover:border-pink-300",
                                state.activeColorSlot === 1 && showColorPicker ? "border-primary bg-pink-50" : "border-gray-200"
                            )}
                         >
                             <span className="text-xs font-bold uppercase text-gray-500">Kolor Dodatkowy</span>
                             {state.colorMode === 2 ? (
                                <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden">
                                     {state.colors[1] ? <img src={`/kolory/${state.colors[1]}`} className="w-full h-full object-cover" /> : <div className="bg-gray-200 w-full h-full" />}
                                 </div>
                                 <span className="text-sm truncate font-medium">{state.colors[1] ? colors.find(c => c.file === state.colors[1])?.name : "Wybierz"}</span>
                                </div>
                             ) : (
                                <span className="text-sm text-gray-400">Niedostępny</span>
                             )}
                         </button>
                     </div>

                     {/* COLOR PICKER INLINE */}
                     {showColorPicker && (
                         <div className="mt-6 animate-in fade-in zoom-in-95 duration-200">
                             <div className="flex items-center justify-between mb-3">
                                 <h3 className="font-bold text-gray-900">Wybierz {state.activeColorSlot === 0 ? "kolor główny" : "kolor dodatkowy"}</h3>
                                 <button onClick={() => setShowColorPicker(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                             </div>
                             <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
                                 {colors.map(color => (
                                     <button 
                                        key={color.file}
                                        onClick={() => handleColorSelect(color.file)}
                                        className="group relative aspect-square rounded-lg overflow-hidden ring-offset-2 hover:ring-2 hover:ring-primary focus:outline-none"
                                        title={color.name}
                                     >
                                         <img src={`/kolory/${color.file}`} className="w-full h-full object-cover" />
                                         {(state.colors[state.activeColorSlot] === color.file) && (
                                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                 <Check className="w-6 h-6 text-white" />
                                             </div>
                                         )}
                                         <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-0.5 text-center truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                             {color.name}
                                         </div>
                                     </button>
                                 ))}
                             </div>
                         </div>
                     )}
                </div>
            )}
        </div>

        {/* Step 3: Carabiners */}
        <div className={cn("border rounded-xl transition-all", activeStep === "carabiners" ? "border-primary ring-1 ring-primary/20 bg-white" : "border-gray-200 bg-gray-50")}>
            <button onClick={() => setActiveStep("carabiners")} className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", activeStep === "carabiners" ? "bg-primary text-white" : "bg-gray-200 text-gray-600")}>3</span>
                    <span className="font-semibold">Karabinki</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeStep === "carabiners" && "rotate-180")} />
            </button>

            {activeStep === "carabiners" && (
                <div className="p-4 pt-0 border-t border-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {carabiners.map(carb => (
                             <button
                                key={carb.id}
                                onClick={() => setState(s => ({...s, carabinerId: carb.id}))}
                                className={cn("relative flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:border-pink-300",
                                    state.carabinerId === carb.id ? "border-primary bg-pink-50" : "border-gray-200"
                                )}
                             >
                                 <div className="w-16 h-16 mb-2">
                                     <img src={`/karabinki/${carb.file}`} className="w-full h-full object-contain mix-blend-multiply" />
                                 </div>
                                 <span className="text-sm font-semibold">{carb.name}</span>
                                 <span className="text-xs text-gray-500">{carb.price === 0 ? "w cenie" : `+${formatPrice(carb.price)}`}</span>
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Summary Footer */}
        <div className="sticky bottom-4 z-50 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl mt-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-500">Łącznie do zapłaty</p>
                    <p className="text-3xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                </div>
                <button 
                    onClick={handleAddToCart}
                    className="bg-primary hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition shadow-lg shadow-pink-500/30 transform hover:scale-105 active:scale-95"
                >
                    Dodaj do koszyka
                </button>
            </div>
            <div className="text-xs text-gray-400 flex flex-wrap gap-2">
                <span>• {currentLength.label}</span>
                <span>• {colors.find(c => c.file === state.colors[0])?.name} {state.colorMode === 2 && `+ ${colors.find(c => c.file === state.colors[1])?.name}`}</span>
                <span>• {currentCarabiner.name}</span>
            </div>
        </div>

      </div>
    </div>
  );
}


