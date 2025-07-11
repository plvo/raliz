import { Button } from '@repo/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import type { SelectOption } from '@repo/ui/components/shuip/select.form-field';
import { Pencil, X } from 'lucide-react';
import React from 'react';

export type SelectFormProps = {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  defaultValue: string;
  isToggleField?: boolean;
  toggleValue?: string;
};

export function SelectForm({
  options,
  label,
  placeholder,
  onValueChange,
  defaultValue,
  isToggleField = false,
  toggleValue,
}: SelectFormProps) {
  // biome-ignore lint/complexity/noUselessTernary: <explanation>
  const [isEditing, setIsEditing] = React.useState(isToggleField ? false : true);

  return (
    <div className='w-full'>
      {label && <p className='text-sm text-muted-foreground'>{label}</p>}
      {isEditing && !isToggleField ? (
        <div className='w-full flex items-stretch gap-2'>
          <Select onValueChange={(v) => onValueChange(v)} defaultValue={defaultValue}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((item) => (
                <SelectItem key={item.value} value={item.value as string}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isToggleField && (
            <Button type='button' variant='ghost' size='icon' onClick={() => setIsEditing(!isEditing)}>
              <X className='size-4' />
            </Button>
          )}
        </div>
      ) : (
        <div className='flex items-center gap-2'>
          {toggleValue ? <p>{toggleValue}</p> : <p className='text-muted-foreground italic'>Non spécifié</p>}

          {isToggleField && (
            <Button type='button' variant='ghost' size='icon' onClick={() => setIsEditing(!isEditing)}>
              <Pencil className='size-4' />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
