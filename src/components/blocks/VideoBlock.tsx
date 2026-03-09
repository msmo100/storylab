import { useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { VideoBlock as VideoBlockType } from '../../types';

interface Props {
  block: VideoBlockType;
}

export function VideoBlock({ block }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: wrapperRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isIntersecting]);

  const decorStyle = {
    boxShadow: block.styles?.boxShadow,
    outline: block.styles?.outlineColor
      ? `${block.styles.outlineWidth ?? '2px'} solid ${block.styles.outlineColor}`
      : undefined,
    borderRadius: block.styles?.borderRadius,
  };

  return (
    <div ref={wrapperRef}>
      <video
        ref={videoRef}
        src={block.src}
        muted
        loop
        playsInline
        className="w-full object-cover"
        style={{
          ...decorStyle,
          objectPosition: block.styles?.objectPosition,
        }}
      />
    </div>
  );
}
