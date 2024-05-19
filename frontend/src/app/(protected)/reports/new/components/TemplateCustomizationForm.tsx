// import { Button } from '@/components/ui/button';
// import { Form } from '@/components/ui/form';

// export const TemplateCustomizationForm = () => {
//   return (
//     <div className="space-y-4 w-[360px]">
//       <div className="flex gap-2 items-center">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => setIsTemplateCustomization(false)}
//         >
//           {'<'}-
//         </Button>
//         <h2 className="text-foreground/90">Template Customization</h2>
//       </div>
//       <Form {...templateForm}>
//         <form
//           onSubmit={templateForm.handleSubmit(onTemplateFormSubmit)}
//           className="space-y-4"
//         >
//           <FormField
//             control={templateForm.control}
//             name="authorName"
//             render={({ field }) => (
//               <FormItem className="w-full relative">
//                 <FormLabel>Author Name</FormLabel>
//                 <FormControl>
//                   <Input
//                     {...field}
//                     className=""
//                     defaultValue={templateSettings.authorName}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={templateForm.control}
//             name="companyName"
//             render={({ field }) => (
//               <FormItem className="w-full relative">
//                 <FormLabel>Company Name</FormLabel>
//                 <FormControl>
//                   <Input
//                     {...field}
//                     className=""
//                     defaultValue={templateSettings.companyName}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={templateForm.control}
//             name="companyLogo"
//             render={({ field }) => (
//               <FormItem className="w-full relative">
//                 <FormLabel>Company Logo</FormLabel>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={templateSettings.companyLogo}
//                 >
//                   <FormControl>
//                     <SelectTrigger className="w-full">
//                       <SelectValue />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {logos ? (
//                       logos.map((logo) => (
//                         <SelectItem value={logo.name} key={logo.id}>
//                           {logo.name}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <SelectItem value="/default_coreline_logo.png">
//                         default_coreline_logo.png
//                       </SelectItem>
//                     )}
//                   </SelectContent>
//                 </Select>
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={templateForm.control}
//             name="colorSchemeId"
//             render={({ field }) => (
//               <FormItem className="w-1/2 pr-2">
//                 <FormLabel>Color Scheme</FormLabel>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={templateSettings.colorSchemeId}
//                 >
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {...COLOR_SCHEMES.map((color) => (
//                       <SelectItem key={color.key} value={color.key}>
//                         <div className="flex gap-1 w-[120px]">
//                           {...color.colors.map((c, i) => (
//                             <div
//                               key={c + i}
//                               style={{ backgroundColor: c }}
//                               className="h-5 w-1/3 rounded-sm"
//                             ></div>
//                           ))}
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <div className="w-full gap-4 flex">
//             <Button
//               className="w-1/2"
//               variant="outline"
//               onClick={() => {
//                 templateForm.reset();
//               }}
//             >
//               Reset
//             </Button>
//             <Button className="w-1/2" type="submit">
//               Apply
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// };
