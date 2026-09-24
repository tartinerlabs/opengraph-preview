import { EmptyState } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import { withCacheBuster } from "./extract-open-graph.ts";

// One token per popup open: every card shares a single fresh request instead
// of the browser serving a stale cached og:image.
const CACHE_BUST_TOKEN = Date.now().toString(36);

export function freshImageSrc(src: string): string {
  return withCacheBuster(src, CACHE_BUST_TOKEN);
}

type PreviewEmptyKind = "broken" | "missing";

const COPY: Record<
  PreviewEmptyKind,
  { description: string; icon: string; title: string }
> = {
  broken: {
    description: "The og:image URL did not return an image.",
    icon: "gravity-ui:circle-xmark",
    title: "Image failed to load",
  },
  missing: {
    description: "This document has no Open Graph or Twitter image tag.",
    icon: "gravity-ui:picture",
    title: "No og:image",
  },
};

type PreviewEmptyStateProps = {
  kind: PreviewEmptyKind;
};

function PreviewEmptyState({ kind }: PreviewEmptyStateProps) {
  const copy = COPY[kind];

  return (
    <EmptyState size="sm">
      <EmptyState.Header>
        <EmptyState.Media variant="icon">
          <Icon icon={copy.icon} />
        </EmptyState.Media>
        <EmptyState.Title>{copy.title}</EmptyState.Title>
        <EmptyState.Description>{copy.description}</EmptyState.Description>
      </EmptyState.Header>
    </EmptyState>
  );
}

type PreviewImageProps = {
  alt: string;
  broken: boolean;
  className?: string;
  onBroken: () => void;
  src: string;
};

export function PreviewImage({
  alt,
  broken,
  className,
  onBroken,
  src,
}: PreviewImageProps) {
  if (!src || broken) {
    return <PreviewEmptyState kind={src && broken ? "broken" : "missing"} />;
  }

  return (
    <img
      alt={alt}
      className={className}
      onError={onBroken}
      src={freshImageSrc(src)}
    />
  );
}
