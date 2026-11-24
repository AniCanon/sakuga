import { cssObj } from '../../internal/css';
import { cx } from '../../internal/cx';
import '../../base.css';
import './CutFace.css';

/* A face as an img, or, with an imageStyle (cropStyle), the picture seen through the square it will be cut to */
export function CutFace({ src, imageStyle, className, alt }: { src: string; imageStyle?: string; className?: string; alt?: string }) {
  if (!imageStyle) return <img src={src} alt={alt || ''} className={className} />;
  return (
    <span className={cx('sk-cut', className)} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
      <img src={src} alt="" draggable={false} style={cssObj(imageStyle)} />
    </span>
  );
}
