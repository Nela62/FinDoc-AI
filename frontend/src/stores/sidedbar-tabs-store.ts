export enum SidebarTabs {
  Audit,
  Chat,
  Library,
  Settings,
}

export type SidebarState = {
  selectedTab: SidebarTabs;
};

export type SidebarActions = {
  setSelectedTab: (selectedTab: SidebarTabs) => void;
};

export const createSidebarSlice = (set: any) => ({
  selectedTab: SidebarTabs.Audit,
  setSelectedTab: (selectedTab: SidebarTabs) => set({ selectedTab }),
});
