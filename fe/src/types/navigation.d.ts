import { Region } from '@/types/region';

export interface SidebarProps {
  onNavItemClick?: (label: string) => void;

  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export interface CollapsibleDrawerProps {
  open: boolean;
  width: number;
  regions: Region[];
  selectedId?: string;
  onToggle: () => void;
  onRegionSelect: (id: string) => void;
}
