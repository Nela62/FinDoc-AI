import { Command as CommandPrimitive } from 'cmdk';
import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

import { Check, CheckIcon } from 'lucide-react';

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Skeleton } from './skeleton';

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ScrollArea, ScrollBar } from './scroll-area';

export type ComboboxOption = Record<'value' | 'label', string> &
  Record<string, string>;

type ComboboxProps = {
  options: ComboboxOption[];
  emptyMessage: string;
  value?: ComboboxOption;
  onValueChange?: (value: ComboboxOption) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export const Combobox = ({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
}: ComboboxProps) => {
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<ComboboxOption>(
    value as ComboboxOption,
  );

  // const handleBlur = useCallback(() => {
  //   setOpen(false);
  //   setInputValue(selected?.label);
  // }, [selected]);

  const handleSelectOption = useCallback(
    (selectedOption: ComboboxOption) => {
      setSelected(selectedOption);
      onValueChange?.(selectedOption);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <Popover open={isOpen} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 font-normal ',
            !selected && 'text-muted-foreground',
          )}
        >
          {selected?.value
            ? options.find((option) => option.value === selected.value)?.label
            : 'Select ticker'}

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
        <CommandPrimitive>
          <CommandInput placeholder={emptyMessage} className="h-9 w-full" />
          {/* <ScrollArea className="h-72 overflow-auto"> */}
          <CommandEmpty>No company found.</CommandEmpty>
          <CommandGroup className="">
            <CommandList className="">
              {options.map((option) => (
                <CommandItem
                  value={option.label}
                  key={option.value}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onSelect={() => handleSelectOption(option)}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      option.value === selected?.value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
          {/* </ScrollArea> */}
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
    // <CommandPrimitive onKeyDown={handleKeyDown}>
    //   <div>
    //     <CommandInput
    //       ref={inputRef}
    //       value={inputValue}
    //       onValueChange={isLoading ? undefined : setInputValue}
    //       onBlur={handleBlur}
    //       onFocus={() => setOpen(true)}
    //       placeholder={placeholder}
    //       disabled={disabled}
    //       className="text-base"
    //     />
    //   </div>
    //   <div className="relative mt-1">
    //     <div
    //       className={cn(
    //         'animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-white outline-none',
    //         isOpen ? 'block' : 'hidden',
    //       )}
    //     >
    //       <CommandList className="rounded-lg ring-1 ring-slate-200">
    //         {isLoading ? (
    //           <CommandPrimitive.Loading>
    //             <div className="p-1">
    //               <Skeleton className="h-8 w-full" />
    //             </div>
    //           </CommandPrimitive.Loading>
    //         ) : null}
    //         {options.length > 0 && !isLoading ? (
    //           <CommandGroup>
    //             {options.map((option) => {
    //               const isSelected = selected?.value === option.value;
    //               return (
    //                 <CommandItem
    //                   key={option.value}
    //                   value={option.label}
    //                   onMouseDown={(event) => {
    //                     event.preventDefault();
    //                     event.stopPropagation();
    //                   }}
    //                   onSelect={() => handleSelectOption(option)}
    //                   className={cn(
    //                     'flex w-full items-center gap-2',
    //                     !isSelected ? 'pl-8' : null,
    //                   )}
    //                 >
    //                   {isSelected ? <Check className="w-4" /> : null}
    //                   {option.label}
    //                 </CommandItem>
    //               );
    //             })}
    //           </CommandGroup>
    //         ) : null}
    //         {!isLoading ? (
    //           <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
    //             {emptyMessage}
    //           </CommandPrimitive.Empty>
    //         ) : null}
    //       </CommandList>
    //     </div>
    //   </div>
    // </CommandPrimitive>
  );
};
