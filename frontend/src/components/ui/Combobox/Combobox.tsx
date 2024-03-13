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
  }, [searchValue, value]);

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
          className="inline-flex h-10 items-center justify-center gap-1 rounded bg-slate-100 px-4 text-black shadow-sm hover:bg-slate-200"
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
          className="z-50 max-h-[336px] rounded-md bg-slate-100 shadow-md"
          style={{
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          }}
          sideOffset={4}
          // alignOffset={-16}
        >
          <div className="relative flex items-center px-2 pt-2 ">
            <div className="pointer-events-none absolute left-1">
              <Search className="h-4 w-4" />
            </div>
            <AriakitCombobox
              autoSelect
              placeholder="Search options"
              className="h-10 appearance-none w-full focus:outline-none rounded-md placeholder:text-gray-500 bg-slate-100 pr-2 pl-6"
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
          <ComboboxList className="overflow-y-auto p-1">
            {matches.map(({ label, value }) => (
              <RadixSelect.Item
                key={value}
                value={value}
                asChild
                className="relative flex h-10 cursor-default scroll-m-1 items-center rounded-md px-4 data-[active-item]:bg-slate-300"
              >
                <ComboboxItem>
                  <RadixSelect.ItemText>{`${value} - ${label}`}</RadixSelect.ItemText>
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
