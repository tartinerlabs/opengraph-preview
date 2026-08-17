import { displayHostname, type OpenGraphTags } from "./extract-open-graph.ts";
import { PreviewImage } from "./preview-image.tsx";

type PlatformPreviewProps = OpenGraphTags & {
  imageBroken: boolean;
  naturalHeight: number | null;
  naturalWidth: number | null;
  onImageBroken: () => void;
};

export function OgImagePreview({
  image,
  imageBroken,
  onImageBroken,
  title,
}: PlatformPreviewProps) {
  return (
    <div className="flex aspect-[1.91/1] items-center justify-center overflow-hidden rounded-2xl bg-surface-secondary">
      <PreviewImage
        alt={title}
        broken={imageBroken}
        className="size-full object-contain"
        onBroken={onImageBroken}
        src={image}
      />
    </div>
  );
}

export function XPreview({
  description,
  image,
  imageBroken,
  onImageBroken,
  title,
  twitterCard,
  twitterDescription,
  twitterImage,
  twitterTitle,
  url,
}: PlatformPreviewProps) {
  const domain = displayHostname(url);
  const isLarge = twitterCard.trim().toLowerCase() === "summary_large_image";
  const cardTitle = twitterTitle || title;
  const cardDescription = twitterDescription || description;
  const cardImage = twitterImage || image;

  if (!isLarge) {
    const showThumb = Boolean(cardImage) && !imageBroken;

    return (
      <div className="flex overflow-hidden rounded-2xl border border-[#cfd9de] bg-white font-sans">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2">
          <p className="line-clamp-2 text-[15px] leading-5 text-[#0f1419]">
            {cardTitle}
          </p>
          {cardDescription ? (
            <p className="line-clamp-2 text-[15px] leading-5 text-[#536471]">
              {cardDescription}
            </p>
          ) : null}
          {domain ? (
            <p className="text-[13px] leading-4 text-[#536471]">{domain}</p>
          ) : null}
        </div>
        {showThumb ? (
          <PreviewImage
            alt={cardTitle}
            broken={imageBroken}
            className="size-[125px] shrink-0 object-cover"
            onBroken={onImageBroken}
            src={cardImage}
          />
        ) : null}
      </div>
    );
  }

  const showOverlay = Boolean(cardImage) && !imageBroken;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#cfd9de] bg-white font-sans">
      <div className="relative aspect-[1.91/1] bg-[#eff3f4]">
        <PreviewImage
          alt={cardTitle}
          broken={imageBroken}
          className="size-full object-cover"
          onBroken={onImageBroken}
          src={cardImage}
        />
        {showOverlay ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
            <p className="line-clamp-2 text-[15px] leading-5 text-white">
              {cardTitle}
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

export function DiscordPreview({
  description,
  imageBroken,
  naturalHeight,
  naturalWidth,
  ogDescription,
  ogImage,
  ogImageHeight,
  ogImageWidth,
  ogSiteName,
  ogTitle,
  onImageBroken,
  themeColor,
  title,
  twitterCard,
}: PlatformPreviewProps) {
  const embedTitle = ogTitle || title;
  const embedDescription = ogDescription || description;
  const barColor = themeColor || "#202225";
  const large = discordUsesLargeImage(
    twitterCard,
    naturalWidth,
    naturalHeight,
    ogImageWidth,
    ogImageHeight,
  );
  const showLarge = Boolean(ogImage) && large;
  const showThumb = Boolean(ogImage) && !large && !imageBroken;

  return (
    <div className="flex overflow-hidden rounded font-sans">
      <div className="w-1 shrink-0" style={{ backgroundColor: barColor }} />
      <div className="flex min-w-0 flex-1 gap-3 bg-[#2b2d31] p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {ogSiteName ? (
            <p className="text-[12px] font-medium leading-4 text-[#949ba4]">
              {ogSiteName}
            </p>
          ) : null}
          <p className="line-clamp-2 text-[16px] font-semibold leading-5 text-[#00a8fc]">
            {embedTitle}
          </p>
          {embedDescription ? (
            <p className="line-clamp-3 text-[14px] leading-5 text-[#dbdee1]">
              {embedDescription}
            </p>
          ) : null}
          {showLarge ? (
            <div className="mt-2 overflow-hidden rounded">
              <PreviewImage
                alt={embedTitle}
                broken={imageBroken}
                className="max-h-[300px] w-full object-contain"
                onBroken={onImageBroken}
                src={ogImage}
              />
            </div>
          ) : null}
        </div>
        {showThumb ? (
          <PreviewImage
            alt={embedTitle}
            broken={imageBroken}
            className="size-20 shrink-0 rounded object-cover"
            onBroken={onImageBroken}
            src={ogImage}
          />
        ) : null}
      </div>
    </div>
  );
}

export function WhatsAppPreview({
  description,
  image,
  imageBroken,
  onImageBroken,
  title,
  url,
}: PlatformPreviewProps) {
  const domain = displayHostname(url);
  const showThumb = Boolean(image) && !imageBroken;

  return (
    <div className="overflow-hidden rounded-lg border border-[#e9edef] bg-white font-sans">
      <div className="flex">
        {showThumb ? (
          <PreviewImage
            alt={title}
            broken={imageBroken}
            className="size-[72px] shrink-0 object-cover"
            onBroken={onImageBroken}
            src={image}
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-2 py-1.5">
          <p className="line-clamp-2 text-[14px] font-medium leading-4 text-[#111b21]">
            {title}
          </p>
          {description ? (
            <p className="line-clamp-1 text-[13px] leading-4 text-[#667781]">
              {description}
            </p>
          ) : null}
          {domain ? (
            <p className="text-[12px] leading-4 text-[#667781]">{domain}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RedditPreview({
  image,
  imageBroken,
  onImageBroken,
  title,
  url,
}: PlatformPreviewProps) {
  const domain = displayHostname(url);

  return (
    <div className="overflow-hidden rounded-lg border border-[#ccc] bg-white font-sans">
      {image ? (
        <div className="flex aspect-[1.91/1] items-center justify-center bg-[#f6f7f8]">
          <PreviewImage
            alt={title}
            broken={imageBroken}
            className="size-full object-cover object-center"
            onBroken={onImageBroken}
            src={image}
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-1 px-3 py-2">
        <p className="line-clamp-2 text-[16px] font-medium leading-5 text-[#1a1a1b]">
          {title}
        </p>
        {domain ? (
          <p className="text-[12px] leading-4 text-[#7c7c7c]">{domain}</p>
        ) : null}
      </div>
    </div>
  );
}

function discordUsesLargeImage(
  twitterCard: string,
  naturalWidth: number | null,
  naturalHeight: number | null,
  declaredWidth: string,
  declaredHeight: string,
): boolean {
  const card = twitterCard.trim().toLowerCase();
  if (card === "summary_large_image") {
    return true;
  }
  if (card === "summary") {
    return false;
  }

  const width = naturalWidth ?? Number.parseInt(declaredWidth, 10);
  const height = naturalHeight ?? Number.parseInt(declaredHeight, 10);
  if (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  ) {
    return width > 400 && width >= height;
  }

  return true;
}
