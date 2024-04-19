export type SidebarTabs =
  | 'Audit'
  | 'Chat'
  | 'Library'
  | 'Settings'
  | 'Citation';

export type SidebarState = {
  selectedTab: SidebarTabs;
};

export type SidebarActions = {
  setSelectedTab: (value: string) => void;
};

export const createSidebarSlice = (set: any) => ({
  selectedTab: 'Audit',
  setSelectedTab: (value: string) => set({ selectedTab: value }),
});
