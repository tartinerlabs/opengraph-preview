import { Spinner } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import { PreviewTabs } from "./preview-tabs.tsx";
import { useOpenGraphPreview } from "./use-open-graph-preview.ts";

function RestrictedState() {
  return (
    <EmptyState size="sm">
      <EmptyState.Header>
        <EmptyState.Media variant="icon">
          <Icon icon="gravity-ui:lock" />
        </EmptyState.Media>
        <EmptyState.Title>Restricted page</EmptyState.Title>
        <EmptyState.Description>
          Open Graph tags cannot be read on browser pages like chrome:// or the
          Web Store.
        </EmptyState.Description>
      </EmptyState.Header>
    </EmptyState>
  );
}

function ErrorState() {
  return (
    <EmptyState size="sm">
      <EmptyState.Header>
        <EmptyState.Media variant="icon">
          <Icon icon="gravity-ui:circle-exclamation" />
        </EmptyState.Media>
        <EmptyState.Title>Preview unavailable</EmptyState.Title>
        <EmptyState.Description>
          The current tab did not return Open Graph tags.
        </EmptyState.Description>
      </EmptyState.Header>
    </EmptyState>
  );
}

function App() {
  const state = useOpenGraphPreview();

  if (state.status === "loading") {
    return (
      <div className="flex min-h-40 items-center justify-center bg-background p-3">
        <Spinner size="sm" />
      </div>
    );
  }

  if (state.status === "restricted") {
    return (
      <div className="bg-background p-3 text-foreground">
        <RestrictedState />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-background p-3 text-foreground">
        <ErrorState />
      </div>
    );
  }

  return <PreviewTabs tags={state.tags} />;
}

export default App;
