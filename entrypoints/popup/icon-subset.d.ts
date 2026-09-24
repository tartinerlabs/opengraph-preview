declare module "virtual:icon-subset" {
  const sets: Array<
    Parameters<typeof import("@iconify/react").addCollection>[0]
  >;
  export default sets;
}
