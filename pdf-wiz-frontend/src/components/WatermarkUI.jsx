import React from 'react';

export default function WatermarkUI({
    watermarkType, setWatermarkType,
    watermarkText, setWatermarkText,
    watermarkImage, setWatermarkImage,
    pdfPreview, watermarkPosition, setWatermarkPosition,
    watermarkOpacity, setWatermarkOpacity,
    watermarkRotation, setWatermarkRotation,
    watermarkScale, setWatermarkScale
}) {

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setWatermarkImage(file);
        }
    };

    return (
        <div className="space-y-4">
            {/* Watermark Type Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Watermark Type
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setWatermarkType('text')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${watermarkType === 'text'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                    >
                        Text
                    </button>
                    <button
                        type="button"
                        onClick={() => setWatermarkType('image')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${watermarkType === 'image'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                    >
                        Image
                    </button>
                </div>
            </div>

            {/* Text Input or Image Upload */}
            {watermarkType === 'text' ? (
                <div className="space-y-2">
                    <label htmlFor="watermarkText" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Watermark Text
                    </label>
                    <input
                        id="watermarkText"
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="e.g., CONFIDENTIAL, DRAFT, © 2024"
                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="watermarkImg" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Watermark Image
                    </label>
                    <input
                        id="watermarkImg"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-400"
                    />
                    {watermarkImage && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            ✓ {watermarkImage.name}
                        </p>
                    )}
                </div>
            )}

            {/* PDF Preview with Click-to-Position */}
            {pdfPreview && (watermarkText || watermarkImage) && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Click on preview to position watermark
                    </label>
                    <div
                        className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden cursor-crosshair"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const img = e.currentTarget.querySelector('img');
                            if (img) {
                                const scaleX = 595 / img.width;
                                const scaleY = 842 / img.height;
                                const pdfX = x * scaleX;
                                const pdfY = 842 - (y * scaleY);
                                setWatermarkPosition({ x: pdfX, y: pdfY });
                            }
                        }}
                    >
                        <img src={pdfPreview} alt="PDF Preview" className="w-full" />
                        {watermarkPosition && watermarkType === 'text' && watermarkText && (
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    left: `${(watermarkPosition.x / 595) * 100}%`,
                                    top: `${(1 - watermarkPosition.y / 842) * 100}%`,
                                    transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)`,
                                    opacity: watermarkOpacity,
                                    color: '#808080',
                                    fontSize: `${60 * watermarkScale * 0.5}px`,
                                    fontFamily: 'Arial, sans-serif',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {watermarkText}
                            </div>
                        )}
                    </div>
                    {watermarkPosition && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            ✓ Watermark preview shown - click again to reposition
                        </p>
                    )}
                </div>
            )}

            {/* Opacity Slider */}
            <div className="space-y-2">
                <label htmlFor="wmOpacity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Opacity: {Math.round(watermarkOpacity * 100)}%
                </label>
                <input
                    id="wmOpacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-2">
                <label htmlFor="wmRotation" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Rotation: {watermarkRotation}°
                </label>
                <input
                    id="wmRotation"
                    type="range"
                    min="0"
                    max="360"
                    value={watermarkRotation}
                    onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Scale Slider */}
            <div className="space-y-2">
                <label htmlFor="wmScale" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Size: {Math.round(watermarkScale * 100)}%
                </label>
                <input
                    id="wmScale"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={watermarkScale}
                    onChange={(e) => setWatermarkScale(parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>
    );
}
