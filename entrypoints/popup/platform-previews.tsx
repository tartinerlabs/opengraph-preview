import { displayHostname, type OpenGraphTags } from "./extract-open-graph.ts";
import { PreviewImage } from "./preview-image.tsx";

type PlatformPreviewProps = OpenGraphTags & {
  imageBroken: boolean;
  onImageBroken: () => void;
};

export function XPreview({
  image,
  imageBroken,
  onImageBroken,
  title,
  url,
}: PlatformPreviewProps) {
  const domain = displayHostname(url);
  const showOverlay = Boolean(image) && !imageBroken;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#cfd9de] bg-white font-sans">
      <div className="relative aspect-[1.91/1] bg-[#eff3f4]">
        <PreviewImage
          alt={title}
          broken={imageBroken}
          className="size-full object-cover"
          onBroken={onImageBroken}
          src={image}
        />
        {showOverlay ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
            <p className="line-clamp-2 text-[15px] leading-5 text-white">
              {title}
            </p>
            {domain ? (
              <p className="text-[13px] leading-4 text-[#8b98a5]">{domain}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FacebookPreview({
  description,
  image,
  imageBroken,
  onImageBroken,
  title,
  url,
}: PlatformPreviewProps) {
  const domain = displayHostname(url);

  return (
    <div className="overflow-hidden border border-[#dadde1] bg-white font-[Helvetica,Arial,sans-serif]">
      <div className="flex aspect-[1.91/1] items-center justify-center bg-[#f0f2f5]">
        <PreviewImage
          alt={title}
          broken={imageBroken}
          className="size-full object-cover"
          onBroken={onImageBroken}
          src={image}
        />
      </div>
      <div className="flex flex-col gap-1 bg-[#f0f2f5] px-4 py-2">
        {domain ? (
          <p className="text-[12px] uppercase leading-4 text-[#65676b]">
            {domain}
          </p>
        ) : null}
        <p className="line-clamp-2 text-[16px] font-semibold leading-5 text-[#050505]">
          {title}
        </p>
        {description ? (
          <p className="line-clamp-1 text-[14px] leading-5 text-[#65676b]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function LinkedInPreview({
  description,
  image,
  imageBroken,
  onImageBroken,
  title,
  url,
}: PlatformPreviewProps) {
  const domain = displayHostname(url);

  return (
    <div className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white font-sans">
      <div className="flex aspect-[1.91/1] items-center justify-center bg-[#f3f2ef]">
        <PreviewImage
          alt={title}
          broken={imageBroken}
          className="size-full object-cover"
          onBroken={onImageBroken}
          src={image}
        />
      </div>
      <div className="flex flex-col gap-1 px-4 py-2">
        <p className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#191919]">
          {title}
        </p>
        {description ? (
          <p className="line-clamp-1 text-[12px] leading-4 text-[#00000099]">
            {description}
          </p>
        ) : null}
        {domain ? (
          <p className="text-[12px] leading-4 text-[#00000099]">{domain}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SlackPreview({
  description,
  image,
  imageBroken,
  onImageBroken,
  siteName,
  title,
}: PlatformPreviewProps) {
  const showThumb = Boolean(image) && !imageBroken;

  return (
    <div className="flex gap-2 border-l-4 border-[#e8e8e8] bg-white py-1 pl-3 font-sans">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[13px] font-bold text-[#1d1c1d]">{siteName}</p>
        <p className="line-clamp-2 text-[15px] font-bold leading-5 text-[#1264a3]">
          {title}
        </p>
        {description ? (
          <p className="line-clamp-3 text-[13px] leading-5 text-[#1d1c1d]">
            {description}
          </p>
        ) : null}
      </div>
      {showThumb ? (
        <PreviewImage
          alt={title}
          broken={imageBroken}
          className="size-20 shrink-0 rounded-lg object-cover"
          onBroken={onImageBroken}
          src={image}
        />
      ) : null}
    </div>
  );
}
