import { Card, Skeleton } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { PopupHeader } from "./popup-header.tsx";
import { PreviewTabs } from "./preview-tabs.tsx";
import { useOpenGraphPreview } from "./use-open-graph-preview.ts";

function StateCard({
  description,
  icon,
  mediaClassName,
  title,
}: {
  description: ReactNode;
  icon: string;
  mediaClassName: string;
  title: string;
}) {
  return (
    <Card
      className="mx-3 mt-3 mb-4 rounded-3xl px-5 pt-7 pb-6"
      variant="default"
    >
      <EmptyState size="sm">
        <EmptyState.Header>
          <EmptyState.Media
            className={`size-12 rounded-2xl ${mediaClassName}`}
            variant="icon"
          >
            <Icon icon={icon} />
          </EmptyState.Media>
          <EmptyState.Title aria-level={2}>{title}</EmptyState.Title>
          <EmptyState.Description>{description}</EmptyState.Description>
        </EmptyState.Header>
      </EmptyState>
    </Card>
  );
}

function LoadingBody() {
  return (
    <div
      className="animate-in fade-in fill-mode-both delay-300 motion-reduce:animate-none"
      role="status"
    >
      <span className="sr-only">Reading tags</span>
      <Skeleton
        animationType="shimmer"
        aria-hidden
        className="bg-default mx-3 mt-0.5 h-10 rounded-full"
      />
      <div aria-hidden className="stage mx-3 mt-3 mb-4 rounded-3xl p-2">
        <div className="flex gap-2 px-1 pt-1 pb-2.5">
          <Skeleton
            animationType="shimmer"
            className="bg-default h-4 w-28 rounded-md"
          />
          <Skeleton
            animationType="shimmer"
            className="bg-default ms-auto h-4 w-16 rounded-md"
          />
        </div>
        <Skeleton
          animationType="shimmer"
          className="bg-default aspect-[1.91/1] rounded-2xl"
        />
      </div>
    </div>
  );
}

function App() {
  const state = useOpenGraphPreview();

  if (state.status === "ready") {
    return <PreviewTabs tab={state.tab} tags={state.tags} />;
  }

  return (
    <div className="relative isolate flex flex-col overflow-hidden bg-background text-foreground">
      {state.status === "loading" ? (
        <>
          <PopupHeader status={{ kind: "loading" }} tab={state.tab} />
          <main>
            <LoadingBody />
          </main>
        </>
      ) : state.status === "restricted" ? (
        <>
          <PopupHeader
            status={{ kind: "none", label: "Not readable" }}
            tab={state.tab}
          />
          <main>
            <StateCard
              description={
                <>
                  Open Graph tags cannot be read on browser pages, extension
                  stores, or <span className="font-mono">file://</span> URLs.
                </>
              }
              icon="gravity-ui:lock"
              mediaClassName="bg-accent-soft text-accent-soft-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_18%,transparent)]"
              title="Restricted page"
            />
          </main>
        </>
      ) : (
        <>
          <PopupHeader
            status={{ kind: "none", label: "No result" }}
            tab={state.tab}
          />
          <main>
            <StateCard
              description="Reading this tab's tags returned no result."
              icon="gravity-ui:circle-exclamation"
              mediaClassName="bg-warning-soft text-warning-soft-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--warning)_28%,transparent)]"
              title="Preview unavailable"
            />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
