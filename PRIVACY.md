# Privacy policy

Open Graph Preview reads Open Graph tags from the page you have open so it can preview the `og:image` and social cards in the popup.

## What the extension reads

When you click the toolbar icon, the extension runs a script in the **active tab only** and reads:

- `og:title` (or the page title)
- `og:description` (or the page description)
- `og:image` (or the Twitter image)
- `og:url` (or the page URL)
- `og:site_name` (or the hostname)

It uses the current tab URL to skip browser-internal pages and to resolve relative image URLs. The `og:image` is then loaded in the popup so you can see it.

## What is not collected or sent

The extension does not:

- Store this information
- Send it to the developer or any other server
- Use analytics, advertising, or accounts
- Access tabs you have not opened the popup on

Page content stays in your browser for that preview. Closing the popup discards it.

## Permissions

- **activeTab** — identify the tab you opened the popup on
- **scripting** — read the Open Graph tags from that tab

## Contact

https://github.com/tartinerlabs/opengraph-preview
