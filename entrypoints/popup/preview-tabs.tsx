import {
  Alert,
  Badge,
  Button,
  Card,
  Chip,
  ColorSwatch,
  Link,
  parseColor,
  Separator,
  Table,
  Tabs,
  Tooltip,
} from "@heroui/react";
import { ItemCard, ItemCardGroup } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import {
  Fragment,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  checksForPlatform,
  type PlatformId,
  platformImage,
} from "./check-platforms.ts";
import {
  type Check,
  evaluateChecks,
  fallbackNote,
  splitCheckMessage,
} from "./evaluate-checks.ts";
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
import { PopupHeader } from "./popup-header.tsx";
import { freshImageSrc } from "./preview-image.tsx";
import type { TabIdentity } from "./use-open-graph-preview.ts";

type PreviewProps = Parameters<typeof OgImagePreview>[0];

const PLATFORM_TABS: Array<{
  icon: string;
  id: PlatformId;
  label: string;
  Preview: (props: PreviewProps) => ReactNode;
  readsCardType: boolean;
  // Approximate width the platform draws this card at. The 800px popup is
  // wider than most feeds, so the stage caps each card rather than stretch it.
  widthClassName: string;
}> = [
  {
    icon: "gravity-ui:picture",
    id: "image",
    label: "Image",
    Preview: OgImagePreview,
    readsCardType: false,
    widthClassName: "max-w-[600px]",
  },
  {
    icon: "simple-icons:x",
    id: "x",
    label: "X",
    Preview: XPreview,
    readsCardType: true,
    widthClassName: "max-w-[516px]",
  },
  {
    icon: "simple-icons:facebook",
    id: "facebook",
    label: "Facebook",
    Preview: FacebookPreview,
    readsCardType: false,
    widthClassName: "max-w-[500px]",
  },
  {
    icon: "simple-icons:linkedin",
    id: "linkedin",
    label: "LinkedIn",
    Preview: LinkedInPreview,
    readsCardType: false,
    widthClassName: "max-w-[552px]",
  },
  {
    icon: "simple-icons:slack",
    id: "slack",
    label: "Slack",
    Preview: SlackPreview,
    readsCardType: true,
    widthClassName: "",
  },
  {
    icon: "simple-icons:discord",
    id: "discord",
    label: "Discord",
    Preview: DiscordPreview,
    readsCardType: true,
    widthClassName: "max-w-[432px]",
  },
  {
    icon: "simple-icons:whatsapp",
    id: "whatsapp",
    label: "WhatsApp",
    Preview: WhatsAppPreview,
    readsCardType: false,
    widthClassName: "max-w-[396px]",
  },
  {
    icon: "simple-icons:reddit",
    id: "reddit",
    label: "Reddit",
    Preview: RedditPreview,
    readsCardType: false,
    widthClassName: "max-w-[640px]",
  },
];

type RawTagGroup = "Open Graph" | "X" | "Other";

const RAW_TAG_ROWS: Array<{
  group: RawTagGroup;
  label: string;
  mono: boolean;
  value: (tags: OpenGraphTags) => string;
}> = [
  {
    group: "Open Graph",
    label: "og:title",
    mono: false,
    value: (tags) => tags.ogTitle,
  },
  {
    group: "Open Graph",
    label: "og:description",
    mono: false,
    value: (tags) => tags.ogDescription,
  },
  {
    group: "Open Graph",
    label: "og:image",
    mono: true,
    value: (tags) => tags.ogImageRaw,
  },
  {
    group: "Open Graph",
    label: "og:image:width",
    mono: true,
    value: (tags) => tags.ogImageWidth,
  },
  {
    group: "Open Graph",
    label: "og:image:height",
    mono: true,
    value: (tags) => tags.ogImageHeight,
  },
  {
    group: "Open Graph",
    label: "og:url",
    mono: true,
    value: (tags) => tags.ogUrl,
  },
  {
    group: "Open Graph",
    label: "og:site_name",
    mono: false,
    value: (tags) => tags.ogSiteName,
  },
  {
    group: "X",
    label: "twitter:card",
    mono: true,
    value: (tags) => tags.twitterCard,
  },
  {
    group: "X",
    label: "twitter:title",
    mono: false,
    value: (tags) => tags.twitterTitle,
  },
  {
    group: "X",
    label: "twitter:description",
    mono: false,
    value: (tags) => tags.twitterDescription,
  },
  {
    group: "X",
    label: "twitter:image",
    mono: true,
    value: (tags) => tags.twitterImageRaw,
  },
  {
    group: "Other",
    label: "theme-color",
    mono: true,
    value: (tags) => tags.themeColor,
  },
];

const RAW_TAG_GROUPS: Array<{
  icon: string;
  iconClassName: string;
  name: RawTagGroup;
}> = [
  { icon: "gravity-ui:globe", iconClassName: "size-3.5", name: "Open Graph" },
  { icon: "simple-icons:x", iconClassName: "size-3", name: "X" },
  { icon: "gravity-ui:code", iconClassName: "size-3.5", name: "Other" },
];

// Tag names inside check messages and notes render as inline code.
const TAG_TOKEN = /((?:og|twitter):[a-z_:]*[a-z_]|theme-color)/g;

function withTagTokens(text: string): ReactNode {
  return text.split(TAG_TOKEN).map((part, index) =>
    index % 2 === 1 ? (
      <code
        className="rounded-md bg-default px-1 py-px font-mono text-[13px] text-foreground"
        // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and static
        key={index}
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pluralIssues(count: number): string {
  return `${count} ${count === 1 ? "issue" : "issues"}`;
}

export function PreviewTabs({
  defaultSelectedKey = "image",
  tab,
  tags,
}: {
  defaultSelectedKey?: PlatformId;
  tab: TabIdentity;
  tags: OpenGraphTags;
}) {
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedKey, setSelectedKey] = useState<string>(defaultSelectedKey);
  const checksRef = useRef<HTMLElement>(null);
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
    img.src = freshImageSrc(tags.image);

    return () => {
      cancelled = true;
    };
  }, [tags.image]);

  const checks = evaluateChecks(tags, {
    brokenImageUrls,
    naturalHeight,
    naturalWidth,
  });
  const previewProps: PreviewProps = {
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

  const focusChecks = () => {
    const section = checksRef.current;
    if (!section) {
      return;
    }
    section.focus({ preventScroll: true });
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  const dimensionsLabel = (src: string) => {
    if (!src) {
      return "No image";
    }
    if (brokenImageUrls.has(src)) {
      return "Did not load";
    }
    if (src === tags.image && naturalWidth && naturalHeight) {
      return `${naturalWidth} × ${naturalHeight}`;
    }
    return "";
  };

  return (
    <div className="relative isolate flex flex-col overflow-hidden bg-background text-foreground">
      <PopupHeader
        status={{ count: checks.length, kind: "issues", onPress: focusChecks }}
        tab={tab}
      />
      <main className="flex flex-col">
        <Tabs
          className="mx-3 mt-0.5 w-auto gap-0"
          selectedKey={selectedKey}
          variant="primary"
          onSelectionChange={(key) => {
            setSelectedKey(String(key));
          }}
        >
          <Tabs.ListContainer className="tab-track rounded-full bg-[color-mix(in_oklab,var(--surface)_55%,transparent)] shadow-[inset_0_0_0_1px_var(--border)]">
            <Tabs.List
              aria-label="Platform previews"
              className="gap-0.5 bg-transparent p-1"
            >
              {PLATFORM_TABS.map(({ icon, id, label }) => {
                const count = checksForPlatform(checks, id, tags).length;
                return (
                  <Tabs.Tab
                    aria-label={
                      count ? `${label}, ${pluralIssues(count)}` : undefined
                    }
                    className="h-8 w-auto shrink-0 gap-1.5 rounded-full px-3 text-[13px] data-[selected=true]:font-semibold data-[selected=true]:text-foreground"
                    id={id}
                    key={id}
                  >
                    {/* The dot sits on the icon, at the tab's start, so the
                      scroll chevron over the strip's end never hides it. */}
                    <Badge.Anchor aria-hidden>
                      <Icon className="size-3.5 shrink-0" icon={icon} />
                      {count ? (
                        <Badge
                          className="size-2 min-h-0 min-w-0 [--badge-border:var(--segment)]"
                          color="warning"
                          placement="top-right"
                          size="sm"
                          variant="primary"
                        />
                      ) : null}
                    </Badge.Anchor>
                    {label}
                    <Tabs.Indicator className="rounded-full bg-segment shadow-[var(--shadow-pill)]" />
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs.ListContainer>
          {PLATFORM_TABS.map(
            ({ id, label, Preview, readsCardType, widthClassName }) => {
              const related = checksForPlatform(checks, id, tags);
              const dimensions = dimensionsLabel(platformImage(id, tags));
              return (
                <Tabs.Panel
                  className="mt-3 rounded-3xl p-0 outline-none data-[focus-visible=true]:status-focused"
                  id={id}
                  key={id}
                >
                  <div className="stage rounded-3xl p-2">
                    <div className="flex min-h-[22px] items-center gap-1.5 px-1 pt-0.5 pb-2 text-[13px] leading-[18px] text-muted">
                      <span className="font-semibold text-foreground">
                        {label}
                      </span>
                      {readsCardType ? (
                        <Chip
                          className="h-[22px] rounded-md bg-surface px-1.5 font-mono text-foreground shadow-[inset_0_0_0_1px_var(--border)]"
                          color="default"
                          size="sm"
                          variant="tertiary"
                        >
                          <Chip.Label>
                            {tags.twitterCard.trim() || "twitter:card not set"}
                          </Chip.Label>
                        </Chip>
                      ) : null}
                      {dimensions ? (
                        <span className="ms-auto font-mono tabular-nums">
                          {dimensions}
                        </span>
                      ) : null}
                    </div>
                    {/* Cards never invert with the popup. Discord's card is dark,
                    so its empty state takes dark tokens. The Image tab gets a
                    ring so its light empty state has an edge on the stage. */}
                    <div
                      className={`mx-auto w-full ${widthClassName} ${
                        id === "discord"
                          ? "dark"
                          : id === "image"
                            ? "light rounded-2xl shadow-[0_0_0_1px_var(--border)]"
                            : "light"
                      }`}
                      data-theme={id === "discord" ? "dark" : "light"}
                    >
                      <Preview {...previewProps} />
                    </div>
                    {related.length > 0 ? (
                      <RelatedIssue checks={related} onShowAll={focusChecks} />
                    ) : null}
                  </div>
                </Tabs.Panel>
              );
            },
          )}
        </Tabs>
        <ChecksSection checks={checks} checksRef={checksRef} tags={tags} />
        <RawTagsSection tags={tags} />
        <Alert
          className="mx-3 mt-4 mb-3.5 w-auto gap-2.5 rounded-[14px] bg-[var(--note)] px-3 py-2.5 shadow-none"
          status="accent"
        >
          <Alert.Indicator className="p-0">
            <Icon className="mt-px size-4" icon="gravity-ui:circle-info" />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Description className="text-[13px] leading-[18px] text-foreground">
              Facebook, LinkedIn, Reddit, and WhatsApp cache the first scrape.{" "}
              <span className="text-muted">This popup cannot clear it.</span>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </main>
    </div>
  );
}

function RelatedIssue({
  checks,
  onShowAll,
}: {
  checks: Check[];
  onShowAll: () => void;
}) {
  const [first] = checks;
  if (!first) {
    return null;
  }
  const more = checks.length - 1;

  return (
    <p className="flex items-start gap-2 px-1 pt-2.5 pb-0.5 text-[13px] leading-[18px] text-muted">
      <Icon
        aria-hidden
        className="mt-0.5 size-3.5 shrink-0 text-warning-soft-foreground"
        icon="gravity-ui:triangle-exclamation"
      />
      <span className="min-w-0 [overflow-wrap:anywhere]">
        {first.message}
        {more > 0 ? (
          <>
            {" "}
            <Link
              className="text-[13px] font-medium text-foreground underline decoration-[var(--border)] underline-offset-2 hover:decoration-current"
              onPress={onShowAll}
            >
              {more} more in Checks
            </Link>
          </>
        ) : null}
      </span>
    </p>
  );
}

function ChecksSection({
  checks,
  checksRef,
  tags,
}: {
  checks: Check[];
  checksRef: RefObject<HTMLElement | null>;
  tags: OpenGraphTags;
}) {
  const setCount = RAW_TAG_ROWS.filter((row) => row.value(tags)).length;

  return (
    <section
      aria-labelledby="checks-heading"
      className="mx-3 mt-4 scroll-mt-3 rounded-2xl outline-none focus-visible:status-focused"
      ref={checksRef}
      tabIndex={-1}
    >
      <ItemCardGroup layout="list" variant="default">
        <ItemCardGroup.Header className="flex items-center gap-2 px-3 pt-3 pb-1.5">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <ItemCardGroup.Title
              aria-level={2}
              className="text-[15px] leading-5 tracking-[-0.012em]"
              id="checks-heading"
            >
              Checks
            </ItemCardGroup.Title>
            <ItemCardGroup.Description className="mt-0 tabular-nums">
              {checks.length === 0 ? "No issues" : pluralIssues(checks.length)}
            </ItemCardGroup.Description>
          </div>
          {checks.length > 0 ? (
            <CopyButton
              label="issues"
              value={[tags.url, ...checks.map((check) => check.message)].join(
                "\n",
              )}
            />
          ) : null}
        </ItemCardGroup.Header>
        {checks.length === 0 ? (
          <ItemCard className="items-start px-3 py-2.5" variant="transparent">
            <ItemCard.Icon className="size-7 rounded-[9px] bg-success-soft text-success-soft-foreground">
              <Icon aria-hidden icon="gravity-ui:circle-check" />
            </ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title className="leading-5">
                No issues in the tags this popup can see.
              </ItemCard.Title>
              <ItemCard.Description>
                {setCount} of {RAW_TAG_ROWS.length} tags set.
              </ItemCard.Description>
            </ItemCard.Content>
          </ItemCard>
        ) : (
          <ul className="flex flex-col">
            {checks.map((check, index) => {
              const { detail, lead } = splitCheckMessage(check.message);
              return (
                <li key={check.id}>
                  {index > 0 ? <Separator className="mx-3 w-auto" /> : null}
                  <ItemCard
                    className="items-start px-3 py-2.5"
                    variant="transparent"
                  >
                    <ItemCard.Icon className="size-7 rounded-[9px] bg-warning-soft text-warning-soft-foreground">
                      <Icon
                        aria-hidden
                        icon="gravity-ui:triangle-exclamation"
                      />
                    </ItemCard.Icon>
                    <ItemCard.Content>
                      <ItemCard.Title className="leading-5">
                        {withTagTokens(lead)}
                      </ItemCard.Title>
                      {detail ? (
                        <ItemCard.Description>
                          {withTagTokens(detail)}
                        </ItemCard.Description>
                      ) : null}
                    </ItemCard.Content>
                  </ItemCard>
                </li>
              );
            })}
          </ul>
        )}
      </ItemCardGroup>
    </section>
  );
}

// A page-controlled value only reaches ColorSwatch when both the browser and
// React Aria parse it as a colour, so url(...) or other strings never load.
function parseSwatchColor(value: string) {
  if (!CSS.supports("color", value)) {
    return null;
  }
  try {
    return parseColor(value);
  } catch {
    return null;
  }
}

function RawTagValue({
  label,
  mono,
  tags,
  value,
}: {
  label: string;
  mono: boolean;
  tags: OpenGraphTags;
  value: string;
}) {
  if (!value) {
    const note = fallbackNote(label, tags);
    return (
      <div className="flex flex-col items-start gap-0.5">
        <Chip
          className="h-5 rounded-md border border-dashed border-[color-mix(in_oklab,var(--muted)_45%,transparent)] bg-transparent px-1.5 font-sans text-muted"
          color="default"
          size="sm"
          variant="tertiary"
        >
          <Chip.Label>Not set</Chip.Label>
        </Chip>
        {note ? (
          <span className="font-sans text-[13px] leading-[18px] text-muted">
            {withTagTokens(note)}
          </span>
        ) : null}
      </div>
    );
  }

  const swatch = label === "theme-color" ? parseSwatchColor(value) : null;

  return (
    <span className={mono ? "font-mono tabular-nums" : undefined}>
      {swatch ? (
        <ColorSwatch
          aria-hidden
          className="me-1.5 inline-block align-[-2px]"
          color={swatch}
          shape="square"
          size="xs"
        />
      ) : null}
      {value}
    </span>
  );
}

function RawTagsSection({ tags }: { tags: OpenGraphTags }) {
  const setCount = RAW_TAG_ROWS.filter((row) => row.value(tags)).length;

  return (
    <section aria-labelledby="raw-tags-heading" className="mx-3 mt-4">
      <Card className="gap-0 overflow-hidden p-0" variant="default">
        <Card.Header className="flex-row items-baseline gap-2 px-3 pt-3 pb-1">
          <Card.Title
            aria-level={2}
            className="text-[15px] font-semibold leading-5 tracking-[-0.012em]"
            id="raw-tags-heading"
            role="heading"
          >
            Raw tags
          </Card.Title>
          <Card.Description className="text-[13px] tabular-nums text-muted">
            {setCount} of {RAW_TAG_ROWS.length} set
          </Card.Description>
        </Card.Header>
        <Card.Content className="gap-0">
          {RAW_TAG_GROUPS.map((group, index) => {
            const rows = RAW_TAG_ROWS.filter((row) => row.group === group.name);
            return (
              <Fragment key={group.name}>
                {index > 0 ? <Separator /> : null}
                <p className="flex items-center gap-1.5 px-3 pt-2.5 pb-1 text-[13px] font-semibold leading-[18px] text-muted">
                  <Icon
                    aria-hidden
                    className={group.iconClassName}
                    icon={group.icon}
                  />
                  {group.name}
                </p>
                <Table
                  className="rounded-none [&_tr:last-child_td]:border-b-0"
                  variant="secondary"
                >
                  <Table.ScrollContainer>
                    <Table.Content
                      aria-label={`${group.name} tags`}
                      className="text-[13px] leading-5"
                    >
                      <Table.Header className="sr-only">
                        <Table.Column className="w-[172px]" isRowHeader>
                          Tag
                        </Table.Column>
                        <Table.Column>Value</Table.Column>
                        <Table.Column className="w-9">Copy</Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {rows.map((row) => {
                          const value = row.value(tags);
                          return (
                            <Table.Row
                              className="align-top"
                              id={row.label}
                              key={row.label}
                            >
                              <Table.Cell className="w-[172px] max-w-[172px] truncate bg-transparent py-[7px] ps-3 pe-2 align-top font-mono text-[13px] text-muted">
                                <span title={row.label}>{row.label}</span>
                              </Table.Cell>
                              <Table.Cell className="bg-transparent px-0 py-[7px] pe-2 align-top text-[13px] leading-5 text-foreground [overflow-wrap:anywhere]">
                                <RawTagValue
                                  label={row.label}
                                  mono={row.mono}
                                  tags={tags}
                                  value={value}
                                />
                              </Table.Cell>
                              <Table.Cell className="w-9 bg-transparent py-1 ps-0 pe-1.5 align-top text-end">
                                {value ? (
                                  <CopyButton label={row.label} value={value} />
                                ) : null}
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              </Fragment>
            );
          })}
        </Card.Content>
      </Card>
    </section>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return (
    <>
      <Tooltip>
        <Button
          aria-label={`Copy ${label}`}
          className={`size-7 rounded-lg transition-colors duration-150 motion-reduce:transition-none ${
            copied
              ? "[--button-bg:var(--accent-soft)] [--button-fg:var(--accent-soft-foreground)]"
              : "text-muted hover:text-foreground [--button-bg-hover:var(--default)]"
          }`}
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={() => {
            void navigator.clipboard.writeText(value).then(() => {
              setCopied(true);
              window.clearTimeout(timeoutRef.current);
              timeoutRef.current = window.setTimeout(() => {
                setCopied(false);
              }, 1500);
            });
          }}
        >
          <Icon
            className="size-4 animate-in fade-in zoom-in-75 duration-150 motion-reduce:animate-none"
            icon={copied ? "gravity-ui:check" : "gravity-ui:copy"}
            key={copied ? "check" : "copy"}
          />
        </Button>
        <Tooltip.Content>{copied ? "Copied" : "Copy"}</Tooltip.Content>
      </Tooltip>
      <span aria-live="polite" className="sr-only">
        {copied ? `Copied ${label}` : ""}
      </span>
    </>
  );
}
