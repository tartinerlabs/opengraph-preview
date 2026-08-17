import { Button, Tabs, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { type Check, evaluateChecks } from "./evaluate-checks.ts";
import type { OpenGraphTags } from "./extract-open-graph.ts";
import {
  DiscordPreview,
  FacebookPreview,
  LinkedInPreview,
  OgImagePreview,
  RedditPreview,
  SlackPreview,
  WhatsAppPreview,
  XPreview,
} from "./platform-previews.tsx";

type PreviewTabsProps = {
  defaultSelectedKey?: string;
  tags: OpenGraphTags;
};

const RAW_TAG_ROWS: Array<{
  label: string;
  value: (tags: OpenGraphTags) => string;
}> = [
  { label: "og:title", value: (tags) => tags.ogTitle },
  { label: "og:description", value: (tags) => tags.ogDescription },
  { label: "og:image", value: (tags) => tags.ogImageRaw },
  { label: "og:image:width", value: (tags) => tags.ogImageWidth },
  { label: "og:image:height", value: (tags) => tags.ogImageHeight },
  { label: "og:url", value: (tags) => tags.ogUrl },
  { label: "og:site_name", value: (tags) => tags.ogSiteName },
  { label: "twitter:card", value: (tags) => tags.twitterCard },
  { label: "twitter:title", value: (tags) => tags.twitterTitle },
  { label: "twitter:description", value: (tags) => tags.twitterDescription },
  { label: "twitter:image", value: (tags) => tags.twitterImageRaw },
  { label: "theme-color", value: (tags) => tags.themeColor },
];

export function PreviewTabs({
  defaultSelectedKey = "image",
  tags,
}: PreviewTabsProps) {
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedKey, setSelectedKey] = useState(defaultSelectedKey);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!tags.image) {
      setNaturalWidth(null);
      setNaturalHeight(null);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setNaturalWidth(img.naturalWidth);
        setNaturalHeight(img.naturalHeight);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setNaturalWidth(null);
        setNaturalHeight(null);
      }
    };
    img.src = tags.image;

    return () => {
      cancelled = true;
    };
  }, [tags.image]);

  const checks = evaluateChecks(tags, {
    brokenImageUrls,
    naturalHeight,
    naturalWidth,
  });
  const previewProps = {
    ...tags,
    brokenImageUrls,
    naturalHeight,
    naturalWidth,
    onImageBroken: (src: string) => {
      if (!src) {
        return;
      }
      setBrokenImageUrls((current) => {
        if (current.has(src)) {
          return current;
        }
        const next = new Set(current);
        next.add(src);
        return next;
      });
    },
  };

  return (
    <div className="flex flex-col gap-2 bg-background p-3 text-foreground">
      {checks.length > 0 ? (
        <Button
          className="self-start text-muted"
          size="sm"
          variant="ghost"
          onPress={() => {
            setSelectedKey("tags");
          }}
        >
          {checks.length} {checks.length === 1 ? "issue" : "issues"}
        </Button>
      ) : null}
      <Tabs
        className="w-full"
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          setSelectedKey(String(key));
        }}
      >
        <Tabs.ListContainer className="overflow-x-auto">
          <Tabs.List aria-label="Platform previews">
            <Tabs.Tab id="image">
              Image
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="x">
              X
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="facebook">
              Facebook
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="linkedin">
              LinkedIn
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="slack">
              Slack
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="discord">
              Discord
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="whatsapp">
              WhatsApp
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="reddit">
              Reddit
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="tags">
              Tags
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel className="pt-2" id="image">
          <OgImagePreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="x">
          <XPreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="facebook">
          <FacebookPreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="linkedin">
          <LinkedInPreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="slack">
          <SlackPreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="discord">
          <DiscordPreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="whatsapp">
          <WhatsAppPreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="reddit">
          <RedditPreview {...previewProps} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-2" id="tags">
          <TagsPanel checks={checks} tags={tags} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

function TagsPanel({ checks, tags }: { checks: Check[]; tags: OpenGraphTags }) {
  return (
    <div className="flex flex-col gap-4">
      {checks.length === 0 ? (
        <p className="text-[14px] leading-5 text-muted">
          No issues in the tags this popup can see.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {checks.map((check) => (
            <li
              className="text-[14px] leading-5 text-foreground"
              key={check.id}
            >
              {check.message}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="text-[16px] font-semibold leading-5">Raw tags</h2>
        <table className="w-full table-fixed text-left text-[13px] leading-4">
          <caption className="sr-only">Raw Open Graph and Twitter tags</caption>
          <thead>
            <tr className="text-muted">
              <th className="w-[7.5rem] pb-1 font-normal">Property</th>
              <th className="pb-1 font-normal">Value</th>
              <th className="w-8 pb-1">
                <span className="sr-only">Copy</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {RAW_TAG_ROWS.map((row) => {
              const value = row.value(tags);
              return (
                <tr className="align-middle" key={row.label}>
                  <td className="py-1 pr-2 text-muted">{row.label}</td>
                  <td
                    className="truncate py-1 pr-2 text-foreground"
                    title={value}
                  >
                    {value}
                  </td>
                  <td className="py-1">
                    <CopyButton label={row.label} value={value} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] leading-4 text-muted">
        Facebook, LinkedIn, Reddit, and WhatsApp cache the first scrape. This
        popup cannot clear it.
      </p>
    </div>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger>
        <Button
          aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
          isDisabled={!value}
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={() => {
            void navigator.clipboard.writeText(value).then(() => {
              setCopied(true);
              window.setTimeout(() => {
                setCopied(false);
              }, 1500);
            });
          }}
        >
          <Icon
            className="size-4 text-muted"
            icon={copied ? "gravity-ui:check" : "gravity-ui:copy"}
          />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{copied ? "Copied" : "Copy"}</Tooltip.Content>
    </Tooltip>
  );
}
