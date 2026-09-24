import { Avatar, Button, Chip, Skeleton } from "@heroui/react";
import { TextShimmer } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import { describeTab } from "./extract-open-graph.ts";
import type { TabIdentity } from "./use-open-graph-preview.ts";

export type HeaderStatus =
  | { kind: "loading" }
  | { kind: "none"; label: "Not readable" | "No result" }
  | { count: number; kind: "issues"; onPress: () => void };

// No HeroUI variant is warning-soft or success-soft, so the ready pill sets
// the Button's own colour variables from the soft status tokens.
const STATUS_TINT = {
  clean:
    "[--button-bg:var(--success-soft)] [--button-bg-hover:color-mix(in_oklab,var(--success-soft)_88%,var(--success-soft-foreground))] [--button-fg:var(--success-soft-foreground)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--success-soft-foreground)_22%,transparent)]",
  issues:
    "[--button-bg:var(--warning-soft)] [--button-bg-hover:color-mix(in_oklab,var(--warning-soft)_88%,var(--warning))] [--button-fg:var(--warning-soft-foreground)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--warning)_28%,transparent)]",
};

function StatusNode({ status }: { status: HeaderStatus }) {
  if (status.kind === "loading") {
    return (
      <span
        aria-hidden
        className="shrink-0 animate-in fade-in fill-mode-both delay-300 motion-reduce:animate-none"
      >
        <TextShimmer className="status-shimmer text-[13px] font-semibold">
          Reading tags
        </TextShimmer>
      </span>
    );
  }

  if (status.kind === "none") {
    return (
      <Chip
        className="h-7 shrink-0 rounded-full px-2.5 font-semibold"
        color="default"
        size="md"
        variant="soft"
      >
        <Chip.Label>{status.label}</Chip.Label>
      </Chip>
    );
  }

  const { count } = status;
  const text =
    count === 0 ? "No issues" : `${count} ${count === 1 ? "issue" : "issues"}`;

  return (
    <Button
      aria-label={`${text}. Go to Checks`}
      className={`h-7 min-w-0 shrink-0 gap-1.5 rounded-full px-2.5 text-[13px] font-semibold tabular-nums ${count === 0 ? STATUS_TINT.clean : STATUS_TINT.issues}`}
      size="sm"
      variant="tertiary"
      onPress={status.onPress}
    >
      <Icon
        aria-hidden
        className="size-3.5"
        icon={
          count === 0
            ? "gravity-ui:circle-check"
            : "gravity-ui:triangle-exclamation"
        }
      />
      {text}
    </Button>
  );
}

export function PopupHeader({
  status,
  tab,
}: {
  status: HeaderStatus;
  tab: TabIdentity | null;
}) {
  const identity = tab ? describeTab(tab.url, tab.title) : null;

  return (
    <>
      <div aria-hidden className="popup-glow" />
      <header className="flex items-center gap-2.5 px-3 pt-3.5 pb-2.5">
        <h1 className="sr-only">Open Graph Preview</h1>
        <Avatar
          aria-hidden
          className="app-mark size-8 shrink-0 rounded-[10px]"
          size="sm"
        >
          <Avatar.Fallback className="bg-transparent text-white">
            <Icon className="size-[17px]" icon="gravity-ui:eye" />
          </Avatar.Fallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          {identity ? (
            <>
              <p
                className="truncate text-[15px] font-semibold leading-5 tracking-[-0.012em]"
                title={tab?.title || undefined}
              >
                {identity.primary}
              </p>
              {identity.secondary ? (
                <p
                  className="truncate font-mono text-[13px] leading-[18px] text-muted"
                  title={tab?.url}
                >
                  {identity.secondary}
                </p>
              ) : null}
            </>
          ) : status.kind === "loading" ? (
            <div aria-hidden className="flex flex-col gap-1.5 py-0.5">
              <Skeleton
                animationType="shimmer"
                className="bg-default h-4 w-28 rounded-md"
              />
              <Skeleton
                animationType="shimmer"
                className="bg-default h-3.5 w-44 rounded-md"
              />
            </div>
          ) : (
            <p className="truncate text-[15px] font-semibold leading-5 tracking-[-0.012em]">
              No page URL
            </p>
          )}
        </div>
        <StatusNode status={status} />
      </header>
    </>
  );
}
