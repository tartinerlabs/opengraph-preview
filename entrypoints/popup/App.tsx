import { Spinner, Tabs } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import {
  FacebookPreview,
  LinkedInPreview,
  OgImagePreview,
  SlackPreview,
  XPreview,
} from "./platform-previews.tsx";
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
  const [imageBroken, setImageBroken] = useState(false);

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

  const previewProps = {
    ...state.tags,
    imageBroken,
    onImageBroken: () => {
      setImageBroken(true);
    },
  };

  return (
    <div className="flex flex-col gap-2 bg-background p-3 text-foreground">
      <Tabs className="w-full" defaultSelectedKey="image">
        <Tabs.ListContainer>
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
      </Tabs>
    </div>
  );
}

export default App;
