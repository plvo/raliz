'use client';

import { cn } from '@repo/ui/lib/utils';
import { Search } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Command, CommandGroup, CommandItem } from '@repo/ui/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Checkbox } from '@repo/ui/components/checkbox';

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  badgeClassName?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Sélectionner...',
  className,
  badgeClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const commandId = React.useId();

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Get labels for selected values
  const selectedLabels = React.useMemo(() => {
    return selected.map((value) => {
      const option = options.find((option) => option.value === value);
      return option?.label || value;
    });
  }, [selected, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          aria-expanded={open}
          aria-controls={commandId}
          className={cn(
            'max-lg:w-full',
            'flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            className,
          )}
          onClick={() => setOpen(!open)}
        >
          <Search className='h-3.5 w-3.5 text-muted-foreground' />

          <div className='flex flex-wrap gap-1 items-center'>
            {selected.length === 0 && <span className='text-muted-foreground text-xs'>{placeholder}</span>}
            {selectedLabels.length > 0 &&
              selectedLabels.map((label, i) => {
                if (i > 5) {
                  return (
                    <Badge key={label} className={cn('px-1.5 py-0.5 text-xs rounded-md font-normal', badgeClassName)}>
                      +{selectedLabels.length - i}
                    </Badge>
                  );
                }
                return (
                  <Badge key={label} className={cn('px-1.5 py-0.5 text-xs rounded-md font-normal', badgeClassName)}>
                    {label}
                  </Badge>
                );
              })}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-52 p-0' align='start'>
        <Command id={commandId}>
          <CommandGroup className='max-h-48 overflow-auto'>
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className='text-sm'
                >
                  <Checkbox checked={isSelected} />
                  <span className='truncate'>{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
