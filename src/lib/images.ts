/**
 * Product images are built by scripts/images/optimize_images.py as
 *   /images/products/<id>.webp (1000 px) and <id>-480.webp (480 px).
 * srcSet lets phones and small cards download the 480 px file.
 */
export function productSrcSet(image: string): string | undefined {
  if (!image.endsWith('.webp')) return undefined;
  return `${image.replace(/\.webp$/, '-480.webp')} 480w, ${image} 1000w`;
}

/** JPEG twin of a product image, for places that may not take WebP (Stripe, schema.org). */
export function productJpg(image: string): string {
  return image.replace(/\.webp$/, '.jpg');
}
