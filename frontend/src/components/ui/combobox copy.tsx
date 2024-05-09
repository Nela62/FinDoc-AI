// import { startTransition, useMemo, useState } from 'react';
// import {
//   Combobox as AriakitCombobox,
//   ComboboxItem,
//   ComboboxList,
//   ComboboxProvider,
// } from '@ariakit/react';
// import * as RadixSelect from '@radix-ui/react-select';
// import { matchSorter } from 'match-sorter';
// import { Check, ChevronsUpDown, Option, Search } from 'lucide-react';

// import * as ScrollArea from '@radix-ui/react-scroll-area';

// // TODO: Improve styling

// export type Option = { label: string; value: string };

// export const Combobox = ({
//   label,
//   options,
//   value,
//   setValue,
//   search,
// }: {
//   label: string;
//   options: Option[];
//   value: string;
//   setValue: (value: string) => void;
//   search: boolean;
// }) => {
//   const [open, setOpen] = useState(false);
//   // const [value, setValue] = useState('');
//   const [searchValue, setSearchValue] = useState('');

//   const matches = useMemo(() => {
//     if (!searchValue) return options;
//     const keys = ['label', 'value'];
//     const matches = matchSorter(options, searchValue, { keys });
//     // Radix Select does not work if we don't render the selected item, so we
//     // make sure to include it in the list of matches.
//     const selectedOption = options.find((o) => o.value === value);
//     if (selectedOption && !matches.includes(selectedOption)) {
//       matches.push(selectedOption);
//     }
//     return matches;
//   }, [searchValue, value, options]);

//   return (
//     <RadixSelect.Root
//       value={value}
//       onValueChange={setValue}
//       open={open}
//       onOpenChange={setOpen}
//     >
//       <ComboboxProvider
//         open={open}
//         setOpen={setOpen}
//         resetValueOnHide
//         includesBaseElement={false}
//         setValue={(value) => {
//           startTransition(() => {
//             setSearchValue(value);
//           });
//         }}
//       >
//         {/* TODO: add focus ring functionality */}
//         <RadixSelect.Trigger
//           aria-label="Option"
//           style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
//           className="inline-flex h-10 items-center justify-between gap-1 rounded-md bg-white border-zinc-300 border-[0.5px] px-4 text-zinc-600 hover:border-zinc-400 focus:outline-none appearance-none"
//         >
//           <RadixSelect.Value placeholder={label} />
//           <RadixSelect.Icon className="transform translate-x-1">
//             <ChevronsUpDown className="h-4 w-4" />
//           </RadixSelect.Icon>
//         </RadixSelect.Trigger>
//         <RadixSelect.Content
//           role="dialog"
//           aria-label="options"
//           position="popper"
//           className="z-50 max-h-[336px] rounded-md bg-white shadow-md border-[0.5px] border-zinc-300 "
//           style={{
//             boxShadow:
//               '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
//           }}
//           // style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
//           sideOffset={4}
//           // alignOffset={-16}
//         >
//           {search ? (
//             <div className="relative flex items-center px-2 pt-2">
//               <div className="pointer-events-none absolute left-3">
//                 <Search className="h-4 w-4 text-zinc-500" />
//               </div>

//               <AriakitCombobox
//                 autoSelect
//                 placeholder="Search"
//                 className="h-10 appearance-none w-full focus:outline-none rounded-md placeholder:text-zinc-500 bg-zinc-100 pr-2 pl-6"
//                 // Ariakit's Combobox manually triggers a blur event on virtually
//                 // blurred items, making them work as if they had actual DOM
//                 // focus. These blur events might happen after the corresponding
//                 // focus events in the capture phase, leading Radix Select to
//                 // close the popover. This happens because Radix Select relies on
//                 // the order of these captured events to discern if the focus was
//                 // outside the element. Since we don't have access to the
//                 // onInteractOutside prop in the Radix SelectContent component to
//                 // stop this behavior, we can turn off Ariakit's behavior here.
//                 onBlurCapture={(event) => {
//                   event.preventDefault();
//                   event.stopPropagation();
//                 }}
//               />
//             </div>
//           ) : null}
//           {/* TODO: Add indicator when item is selected */}
//           <ComboboxList className="px-2 py-1 focus:outline-none appearance-none">
//             {/* TODO: is there a more reliable way to determine the height? */}
//             {matches.length > 7 ? (
//               <ScrollArea.Root className="overflow-hidden h-[282px]">
//                 <ScrollArea.Viewport className="w-full h-full">
//                   <OptionsListComponent />
//                 </ScrollArea.Viewport>
//                 <ScrollArea.Scrollbar
//                   className="flex select-none touch-none p-0.5 transition-colors ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
//                   orientation="vertical"
//                 >
//                   <ScrollArea.Thumb className="flex-1 bg-zinc-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
//                 </ScrollArea.Scrollbar>
//               </ScrollArea.Root>
//             ) : (
//               <OptionsListComponent />
//             )}
//           </ComboboxList>
//         </RadixSelect.Content>
//       </ComboboxProvider>
//     </RadixSelect.Root>
//   );

//   function OptionsListComponent() {
//     return matches.map(({ label, value }) => (
//       <RadixSelect.Item
//         key={value}
//         value={value}
//         asChild
//         className="relative flex h-10 cursor-default scroll-m-1 items-center rounded-md px-4 data-[active-item]:bg-indigo-100 appearance-none focus:outline-none"
//       >
//         <ComboboxItem>
//           <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
//         </ComboboxItem>
//       </RadixSelect.Item>
//     ));
//   }
// };

// ('use client');

// import * as React from 'react';
// import {
//   CaretSortIcon,
//   CheckIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
// } from '@radix-ui/react-icons';
// import * as SelectPrimitive from '@radix-ui/react-select';

// import { cn } from '@/lib/utils';

// const Combobox = SelectPrimitive.Root;

// const ComboboxGroup = SelectPrimitive.Group;

// const ComboboxValue = SelectPrimitive.Value;

// const SelectTrigger = React.forwardRef<
//   React.ElementRef<typeof SelectPrimitive.Trigger>,
//   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
// >(({ className, children, ...props }, ref) => (
//   <SelectPrimitive.Trigger
//     ref={ref}
//     className={cn(
//       'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
//       className,
//     )}
//     {...props}
//   >
//     {children}
//     <SelectPrimitive.Icon asChild>
//       <CaretSortIcon className="h-4 w-4 opacity-50" />
//     </SelectPrimitive.Icon>
//   </SelectPrimitive.Trigger>
// ));
// SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// const SelectScrollUpButton = React.forwardRef<
//   React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
//   React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
// >(({ className, ...props }, ref) => (
//   <SelectPrimitive.ScrollUpButton
//     ref={ref}
//     className={cn(
//       'flex cursor-default items-center justify-center py-1',
//       className,
//     )}
//     {...props}
//   >
//     <ChevronUpIcon />
//   </SelectPrimitive.ScrollUpButton>
// ));
// SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

// const SelectScrollDownButton = React.forwardRef<
//   React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
//   React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
// >(({ className, ...props }, ref) => (
//   <SelectPrimitive.ScrollDownButton
//     ref={ref}
//     className={cn(
//       'flex cursor-default items-center justify-center py-1',
//       className,
//     )}
//     {...props}
//   >
//     <ChevronDownIcon />
//   </SelectPrimitive.ScrollDownButton>
// ));
// SelectScrollDownButton.displayName =
//   SelectPrimitive.ScrollDownButton.displayName;

// const SelectContent = React.forwardRef<
//   React.ElementRef<typeof SelectPrimitive.Content>,
//   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
// >(({ className, children, position = 'popper', ...props }, ref) => (
//   <SelectPrimitive.Portal>
//     <SelectPrimitive.Content
//       ref={ref}
//       className={cn(
//         'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
//         position === 'popper' &&
//           'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
//         className,
//       )}
//       position={position}
//       {...props}
//     >
//       <SelectScrollUpButton />
//       <SelectPrimitive.Viewport
//         className={cn(
//           'p-1',
//           position === 'popper' &&
//             'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
//         )}
//       >
//         {children}
//       </SelectPrimitive.Viewport>
//       <SelectScrollDownButton />
//     </SelectPrimitive.Content>
//   </SelectPrimitive.Portal>
// ));
// SelectContent.displayName = SelectPrimitive.Content.displayName;

// const SelectLabel = React.forwardRef<
//   React.ElementRef<typeof SelectPrimitive.Label>,
//   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
// >(({ className, ...props }, ref) => (
//   <SelectPrimitive.Label
//     ref={ref}
//     className={cn('px-2 py-1.5 text-sm font-semibold', className)}
//     {...props}
//   />
// ));
// SelectLabel.displayName = SelectPrimitive.Label.displayName;

// const SelectItem = React.forwardRef<
//   React.ElementRef<typeof SelectPrimitive.Item>,
//   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
// >(({ className, children, ...props }, ref) => (
//   <SelectPrimitive.Item
//     ref={ref}
//     className={cn(
//       'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
//       className,
//     )}
//     {...props}
//   >
//     <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
//       <SelectPrimitive.ItemIndicator>
//         <CheckIcon className="h-4 w-4" />
//       </SelectPrimitive.ItemIndicator>
//     </span>
//     <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
//   </SelectPrimitive.Item>
// ));
// SelectItem.displayName = SelectPrimitive.Item.displayName;

// const SelectSeparator = React.forwardRef<
//   React.ElementRef<typeof SelectPrimitive.Separator>,
//   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
// >(({ className, ...props }, ref) => (
//   <SelectPrimitive.Separator
//     ref={ref}
//     className={cn('-mx-1 my-1 h-px bg-muted', className)}
//     {...props}
//   />
// ));
// SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// export {
//   Select,
//   SelectGroup,
//   SelectValue,
//   SelectTrigger,
//   SelectContent,
//   SelectLabel,
//   SelectItem,
//   SelectSeparator,
//   SelectScrollUpButton,
//   SelectScrollDownButton,
// };
