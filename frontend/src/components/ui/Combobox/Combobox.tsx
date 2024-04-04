import { startTransition, useMemo, useState } from 'react';
import {
  Combobox as AriakitCombobox,
  ComboboxItem,
  ComboboxList,
  ComboboxProvider,
} from '@ariakit/react';
import * as RadixSelect from '@radix-ui/react-select';
import { matchSorter } from 'match-sorter';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

import * as ScrollArea from '@radix-ui/react-scroll-area';

// TODO: Improve styling

export type Option = { label: string; value: string };

export const Combobox = ({
  label,
  options,
  value,
  setValue,
}: {
  label: string;
  options: Option[];
  value: string;
  setValue: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  // const [value, setValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const matches = useMemo(() => {
    if (!searchValue) return options;
    const keys = ['label', 'value'];
    const matches = matchSorter(options, searchValue, { keys });
    // Radix Select does not work if we don't render the selected item, so we
    // make sure to include it in the list of matches.
    const selectedOption = options.find((o) => o.value === value);
    if (selectedOption && !matches.includes(selectedOption)) {
      matches.push(selectedOption);
    }
    return matches;
  }, [searchValue, value, options]);

  return (
    <RadixSelect.Root
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
    >
      <ComboboxProvider
        open={open}
        setOpen={setOpen}
        resetValueOnHide
        includesBaseElement={false}
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <RadixSelect.Trigger
          aria-label="Option"
          style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
          className="inline-flex h-10 items-center justify-between gap-1 rounded-md bg-white border-zinc-300 border-[0.5px] px-4 text-zinc-600 hover:border-zinc-400"
        >
          <RadixSelect.Value placeholder={label} />
          <RadixSelect.Icon className="transform translate-x-1">
            <ChevronsUpDown className="h-4 w-4" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Content
          role="dialog"
          aria-label="options"
          position="popper"
          className="z-50 max-h-[336px] rounded-md bg-white shadow-md border-[0.5px] border-zinc-300"
          style={{
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          }}
          // style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
          sideOffset={4}
          // alignOffset={-16}
        >
          <div className="relative flex items-center px-2 pt-2">
            <div className="pointer-events-none absolute left-3">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <AriakitCombobox
              autoSelect
              placeholder="Search"
              className="h-10 appearance-none w-full focus:outline-none rounded-md placeholder:text-zinc-500 bg-zinc-100 pr-2 pl-6"
              // Ariakit's Combobox manually triggers a blur event on virtually
              // blurred items, making them work as if they had actual DOM
              // focus. These blur events might happen after the corresponding
              // focus events in the capture phase, leading Radix Select to
              // close the popover. This happens because Radix Select relies on
              // the order of these captured events to discern if the focus was
              // outside the element. Since we don't have access to the
              // onInteractOutside prop in the Radix SelectContent component to
              // stop this behavior, we can turn off Ariakit's behavior here.
              onBlurCapture={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </div>
          <ComboboxList className="p-1">
            <ScrollArea.Root className="overflow-hidden"></ScrollArea.Root>
            {matches.map(({ label, value }) => (
              <RadixSelect.Item
                key={value}
                value={value}
                asChild
                className="relative flex h-10 cursor-default scroll-m-1 items-center rounded-md px-4 data-[active-item]:bg-indigo-100"
              >
                <ComboboxItem>
                  <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute l-1">
                    <Check className="h-4 w-4" />
                  </RadixSelect.ItemIndicator>
                </ComboboxItem>
              </RadixSelect.Item>
            ))}
          </ComboboxList>
        </RadixSelect.Content>
      </ComboboxProvider>
    </RadixSelect.Root>
  );
};
