/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw, Check, RefreshCw } from 'lucide-react';

interface Point { x: number; y: number; }
interface Area  { x: number; y: number; width: number; height: number; }

interface Props {
  imageSrc: string;
  onSave:   (croppedDataUrl: string) => void;
  onCancel: () => void;
}

// Draw the cropped area onto a canvas and return a base64 data URL
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.addEventListener('load', () => res(img));
    img.addEventListener('error', rej);
    img.src = imageSrc;
  });

  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d')!;
  const rad     = (rotation * Math.PI) / 180;
  const sin     = Math.abs(Math.sin(rad));
  const cos     = Math.abs(Math.cos(rad));
  const bW      = image.width  * cos + image.height * sin;
  const bH      = image.width  * sin + image.height * cos;

  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // redraw with crop offset
  const safeCanvas  = document.createElement('canvas');
  safeCanvas.width  = bW;
  safeCanvas.height = bH;
  const safeCtx = safeCanvas.getContext('2d')!;
  safeCtx.translate(bW / 2, bH / 2);
  safeCtx.rotate(rad);
  safeCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const cropCanvas  = document.createElement('canvas');
  cropCanvas.width  = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;
  const cropCtx = cropCanvas.getContext('2d')!;
  cropCtx.drawImage(
    safeCanvas,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  );

  return cropCanvas.toDataURL('image/jpeg', 0.92);
}

const ASPECT_OPTIONS = [
  { label: 'Free',   value: undefined  },
  { label: '1 : 1',  value: 1          },
  { label: '4 : 3',  value: 4 / 3      },
  { label: '16 : 9', value: 16 / 9     },
  { label: '3 : 4',  value: 3 / 4      },
];

export const ImageEditor: React.FC<Props> = ({ imageSrc, onSave, onCancel }) => {
  const [crop,       setCrop]       = useState<Point>({ x: 0, y: 0 });
  const [zoom,       setZoom]       = useState(1);
  const [rotation,   setRotation]   = useState(0);
  const [aspect,     setAspect]     = useState<number | undefined>(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving,     setSaving]     = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedArea) return;
    setSaving(true);
    try {
      const url = await getCroppedImg(imageSrc, croppedArea, rotation);
      onSave(url);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a1005]/97 backdrop-blur-sm flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/15 flex-shrink-0">
        <div>
          <h3 className="text-white font-display font-bold text-lg">Edit Image</h3>
          <p className="text-[#F5F0E8]/40 text-xs">Crop, zoom, rotate and adjust to your liking</p>
        </div>
        <button onClick={onCancel} className="text-[#F5F0E8]/40 hover:text-white transition-colors p-1">
          <X size={22} />
        </button>
      </div>

      {/* ── Cropper area ── */}
      <div className="relative flex-1 bg-[#060e04]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
          style={{
            containerStyle: { background: '#060e04' },
            cropAreaStyle: {
              border: '2px solid #D4AF37',
              boxShadow: '0 0 0 9999px rgba(6,14,4,0.7)',
            },
          }}
        />
      </div>

      {/* ── Controls ── */}
      <div className="flex-shrink-0 bg-[#0F1A08] border-t border-[#D4AF37]/15 px-5 py-4 space-y-4">

        {/* Aspect ratio */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[#D4AF37]/60 text-xs uppercase tracking-widest w-16">Aspect</span>
          <div className="flex gap-2 flex-wrap">
            {ASPECT_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => setAspect(opt.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  aspect === opt.value
                    ? 'bg-[#D4AF37] text-[#0F1A08] border-[#D4AF37]'
                    : 'border-[#D4AF37]/20 text-[#F5F0E8]/50 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-3">
          <span className="text-[#D4AF37]/60 text-xs uppercase tracking-widest w-16">Zoom</span>
          <button onClick={() => setZoom(z => Math.max(1, z - 0.1))} className="text-[#D4AF37]/60 hover:text-[#D4AF37]">
            <ZoomOut size={18} />
          </button>
          <input
            type="range" min={1} max={3} step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#D4AF37] h-1 cursor-pointer"
          />
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-[#D4AF37]/60 hover:text-[#D4AF37]">
            <ZoomIn size={18} />
          </button>
          <span className="text-[#F5F0E8]/30 text-xs w-10 text-right">{zoom.toFixed(1)}×</span>
        </div>

        {/* Rotation */}
        <div className="flex items-center gap-3">
          <span className="text-[#D4AF37]/60 text-xs uppercase tracking-widest w-16">Rotate</span>
          <button onClick={() => setRotation(r => r - 90)} className="text-[#D4AF37]/60 hover:text-[#D4AF37] scale-x-[-1]">
            <RotateCw size={18} />
          </button>
          <input
            type="range" min={-180} max={180} step={1}
            value={rotation}
            onChange={e => setRotation(Number(e.target.value))}
            className="flex-1 accent-[#D4AF37] h-1 cursor-pointer"
          />
          <button onClick={() => setRotation(r => r + 90)} className="text-[#D4AF37]/60 hover:text-[#D4AF37]">
            <RotateCw size={18} />
          </button>
          <span className="text-[#F5F0E8]/30 text-xs w-10 text-right">{rotation}°</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D4AF37]/20 text-[#F5F0E8]/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all text-sm"
          >
            <RefreshCw size={14} /> Reset
          </button>

          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all text-sm"
          >
            <X size={14} /> Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {saving
              ? <><div className="w-4 h-4 border-2 border-[#0F1A08]/40 border-t-[#0F1A08] rounded-full animate-spin" /> Saving...</>
              : <><Check size={16} /> Apply & Save</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};
