import { Region } from '@/types/region';

export interface TabProps {
  region: Region;
}

export interface MetaInfo {
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
}
