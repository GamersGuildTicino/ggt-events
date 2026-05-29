import { Image } from "@chakra-ui/react";
import type { ImageProps } from "@chakra-ui/react";
import { useState } from "react";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Image With Fallback
//------------------------------------------------------------------------------

type ImageWithFallbackProps = ImageProps & {
  fallback?: ReactNode;
};

export default function ImageWithFallback({
  fallback = null,
  src,
  ...imageProps
}: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();

  if (!src || failedSrc === src) return fallback;

  return <Image {...imageProps} onError={() => setFailedSrc(src)} src={src} />;
}
