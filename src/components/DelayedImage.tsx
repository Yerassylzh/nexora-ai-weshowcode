import React, { useState, useEffect } from 'react';

interface DelayedImageProps {
  src: string;
  alt: string;
  className?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export default function DelayedImage({ 
  src, 
  alt, 
  className = '',
  maxRetries = 15, // Try 15 times
  retryDelay = 10000 // Wait 10 seconds between retries
}: DelayedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    console.log('🖼️ DelayedImage src changed, resetting state:', src);
    setImageSrc(null);
    setIsLoading(true);
    setRetryCount(0);
    setError(false);
  }, [src]);

  useEffect(() => {
    console.log('🖼️ DelayedImage useEffect triggered:', { src, retryCount });

    if (!src) {
      console.log('⚠️ No src, skipping load');
      return;
    }

    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const loadImage = () => {
      console.log('🔄 Attempting to load image:', src);
      const img = new Image();
      
      img.onload = () => {
        console.log('✅ Image loaded successfully!', src);
        if (mounted) {
          setImageSrc(src);
          setIsLoading(false);
          setError(false);
        }
      };
      
      img.onerror = () => {
        if (!mounted) return;
        
        if (retryCount < maxRetries) {
          console.log(`❌ Image not ready yet, retry ${retryCount + 1}/${maxRetries} in ${retryDelay/1000}s...`);
          retryTimeout = setTimeout(() => {
            if (mounted) {
              setRetryCount(prev => prev + 1);
            }
          }, retryDelay);
        } else {
          console.error('💀 Image failed to load after max retries');
          setIsLoading(false);
          setError(true);
        }
      };
      
      img.src = src;
    };

    loadImage();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [src, retryCount, maxRetries, retryDelay]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-neutral-800`}>
        <p className="text-neutral-500 text-sm">Не удалось загрузить изображение</p>
      </div>
    );
  }

  if (isLoading || !imageSrc) {
    const progress = (retryCount / maxRetries) * 100;
    
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-neutral-800`}>
        <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-neutral-400 text-sm mb-3">
          Изображение обрабатывается...
        </p>
        {retryCount > 0 && (
          <div className="w-48 space-y-2">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Попытка {retryCount}/{maxRetries}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
}
