
// import React, { useRef, useEffect } from 'react';

// interface HeatmapOverlayProps {
//   originalImage: string;
//   heatmapData: string; // Base64 of the activation map
// }

// const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ originalImage, heatmapData }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const img = new Image();
//     const heatmap = new Image();

//     img.onload = () => {
//       canvas.width = img.naturalWidth;
//       canvas.height = img.naturalHeight;
//       ctx.drawImage(img, 0, 0);

//       heatmap.onload = () => {
//         ctx.globalAlpha = 0.55;
//         ctx.drawImage(heatmap, 0, 0, canvas.width, canvas.height);
//         ctx.globalAlpha = 1.0;
//       };
//       heatmap.src = heatmapData;
//     };
//     img.src = originalImage;
//   }, [originalImage, heatmapData]);

//   return (
//     <div className="relative w-full h-full flex items-center justify-center">
//       <canvas 
//         ref={canvasRef} 
//         className="max-h-full max-w-full object-contain shadow-2xl dark:shadow-none"
//       />
//       <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur">
//         <div className="w-24 h-2 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded-full"></div>
//         <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">Activation</span>
//       </div>
//     </div>
//   );
// };

// export default HeatmapOverlay;
















import React, { useRef, useEffect } from 'react';

interface HeatmapOverlayProps {
  originalImage: string;
  heatmapData: string; // Base64 of the activation map
  opacity: number;
  hueShift: number; // For shifting colors/gradients
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ originalImage, heatmapData, opacity, hueShift }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const heatmap = new Image();

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      heatmap.onload = () => {
        ctx.save();
        ctx.globalAlpha = opacity;
        // Applying a hue-rotate filter to the heatmap layer only
        ctx.filter = `hue-rotate(${hueShift}deg) saturate(1.5)`;
        ctx.drawImage(heatmap, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      };
      heatmap.src = heatmapData;
    };
    img.src = originalImage;
  }, [originalImage, heatmapData, opacity, hueShift]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="max-h-full max-w-full object-contain shadow-2xl dark:shadow-none"
      />
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur">
        <div 
          className="w-24 h-2 rounded-full"
          style={{ 
            background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #ef4444)',
            filter: `hue-rotate(${hueShift}deg)`
          }}
        ></div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">Dynamic Map</span>
      </div>
    </div>
  );
};

export default HeatmapOverlay;
      