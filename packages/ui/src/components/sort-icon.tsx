import { ArrowDown, ArrowUp } from 'lucide-react';
import type React from 'react';

interface SortIconProps {
  field: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const SortIcon: React.FC<SortIconProps> = ({ field, sortField, sortDirection }) => {
  if (!sortField || field !== sortField) return null;
  return sortDirection === 'asc' ? (
    <ArrowUp className='h-3 w-3 ml-1 inline' />
  ) : (
    <ArrowDown className='h-3 w-3 ml-1 inline' />
  );
};
