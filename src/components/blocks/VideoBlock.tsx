import { useEffect, useRef } from 'react';
import type { VideoBlock as VideoBlockType } from '../../types';

interface Props { block: VideoBlockType }

export function VideoBlock({ block }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !block.autoplay) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.3 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [block.autoplay]);

  const style: React.CSSProperties = {
    maxWidth: block.maxWidth ?? '100%',
    margin: '0 auto',
    borderRadius: block.styles?.borderRadius,
    overflow: 'hidden',
  };

  return (
    <div style={style}>
      <video
        ref={videoRef}
        src={block.src}
        muted
        loop
        playsInline
        controls={!block.autoplay}
        className="w-full h-auto block"
        style={{ objectPosition: block.styles?.objectPosition }}
      />
    </div>
  );
}
