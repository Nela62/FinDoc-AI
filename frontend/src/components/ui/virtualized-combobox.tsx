import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

export type Option = {
  value: string;
  label: string;
};

interface VirtualizedCommandProps {
  height: string;
  options: Option[];
  placeholder: string;
  selectedOption?: Option;
  onSelectOption?: (optionValue: string) => void;
}

const VirtualizedCommand = ({
  height,
  options,
  placeholder,
  selectedOption,
  onSelectOption,
}: VirtualizedCommandProps) => {
  const [filteredOptions, setFilteredOptions] =
    React.useState<Option[]>(options);
  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (filteredOptions[i].label.length > 48 ? 50 : 35),
    overscan: 5,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const handleSearch = (search: string) => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase() ?? []),
      ),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
  };

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput onValueChange={handleSearch} placeholder={placeholder} />
      <CommandEmpty>No item found.</CommandEmpty>
      <CommandGroup>
        <CommandList
          ref={parentRef}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
            overflow: 'auto',
          }}
        >
          {virtualOptions.map((virtualOption) => (
            <CommandItem
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualOption.size}px`,
                transform: `translateY(${virtualOption.start}px)`,
              }}
              key={filteredOptions[virtualOption.index].value}
              value={filteredOptions[virtualOption.index].value}
              onSelect={onSelectOption}
              className={cn(
                selectedOption?.value ===
                  filteredOptions[virtualOption.index].value && 'bg-accent',
              )}
            >
              {filteredOptions[virtualOption.index].label}
            </CommandItem>
          ))}
        </CommandList>
      </CommandGroup>
    </Command>
  );
};

interface VirtualizedComboboxProps {
  options: Option[];
  searchPlaceholder?: string;
  width?: string;
  height?: string;
  value?: Option;
  onValueChange?: (value: Option) => void;
}

export function VirtualizedCombobox({
  options,
  searchPlaceholder = 'Search items...',
  width = '400px',
  height = '200px',
  value,
  onValueChange,
}: VirtualizedComboboxProps) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedOption, setSelectedOption] = React.useState<Option>(
    value as Option,
  );

  const handleSelectOption = React.useCallback(
    (option: Option) => {
      setSelectedOption(option);
      onValueChange?.(option);
    },
    [onValueChange],
  );

  const findOption = (): string => {
    const label = options.find(
      (option) => option.value === selectedOption.value,
    )?.label;

    if (!label) {
      throw new Error(
        'An exception occurred. ' +
          selectedOption.value +
          ' is not found in options list.',
      );
    }

    return label;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 font-normal ',
            !selectedOption && 'text-muted-foreground',
          )}
        >
          {selectedOption?.value
            ? findOption().length > 45
              ? findOption().slice(0, 45) + '...'
              : findOption()
            : searchPlaceholder}
          <CaretSortIcon className="h-4 w-4 opacity-50" />
          {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-1',
          'w-full min-w-[var(--radix-popover-trigger-width)]',
        )}
      >
        <VirtualizedCommand
          height={height}
          options={options}
          placeholder={searchPlaceholder}
          selectedOption={selectedOption}
          onSelectOption={(currentValue) => {
            const option = options.find(
              (option) => option.value === currentValue,
            );
            option && handleSelectOption(option);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
