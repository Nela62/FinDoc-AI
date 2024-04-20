export type SidebarTabs = 'Audit' | 'Chat' | 'Library' | 'Settings';

export type SidebarState = {
  selectedTab: SidebarTabs;
};

export type SidebarActions = {
  setSelectedTab: (value: SidebarTabs) => void;
};

export const createSidebarSlice = (set: any) => ({
  selectedTab: 'Audit' as SidebarTabs,
  setSelectedTab: (value: SidebarTabs) => set({ selectedTab: value }),
});
