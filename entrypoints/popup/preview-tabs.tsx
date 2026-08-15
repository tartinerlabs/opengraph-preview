import { Tabs } from "@heroui/react";
import { useState } from "react";
import type { OpenGraphTags } from "./extract-open-graph.ts";
import {
  FacebookPreview,
  LinkedInPreview,
  OgImagePreview,
  SlackPreview,
  XPreview,
} from "./platform-previews.tsx";

type PreviewTabsProps = {
  defaultSelectedKey?: string;
  tags: OpenGraphTags;
};

export function PreviewTabs({
  defaultSelectedKey = "image",
  tags,
}: PreviewTabsProps) {
  const [imageBroken, setImageBroken] = useState(false);
  const previewProps = {
    ...tags,
    imageBroken,
    onImageBroken: () => {
      setImageBroken(true);
    },
  };

  return (
    <div className="flex flex-col gap-2 bg-background p-3 text-foreground">
      <Tabs className="w-full" defaultSelectedKey={defaultSelectedKey}>
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
