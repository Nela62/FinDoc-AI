import { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { TemplateConfig } from '../../Component';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DisplayLogo } from './DisplayLogo';

const templateFormSchema = z.object({
  authorName: z.string(),
  authorCompanyName: z.string(),
  authorCompanyLogo: z.string(),
  colorScheme: z.string(),
});

const defaultCompanyLogo = '/default_finpanel_logo.png';

export const TemplateCustomizationForm = ({
  userId,
  templateConfig,
  setTemplateConfig,
  setIsTemplateCustomization,
}: {
  userId: string;
  templateConfig: TemplateConfig;
  setTemplateConfig: Dispatch<SetStateAction<TemplateConfig | null>>;
  setIsTemplateCustomization: Dispatch<SetStateAction<boolean>>;
}) => {
  const templateForm = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      authorName: templateConfig.authorName,
      authorCompanyName: templateConfig.authorCompanyName,
      colorScheme: templateConfig.colorScheme.id,
    },
  });

  const onTemplateFormSubmit = (values: z.infer<typeof templateFormSchema>) => {
    const colorScheme = templateConfig.colorSchemesList.find(
      (scheme) => values.colorScheme === scheme.id,
    );

    if (!colorScheme) {
      throw new Error('Color scheme not found.');
    }

    setTemplateConfig({
      authorName: values.authorName,
      authorCompanyName: values.authorCompanyName,
      colorScheme: colorScheme,
      authorCompanyLogo: values.authorCompanyLogo ?? defaultCompanyLogo,
      colorSchemesList: templateConfig.colorSchemesList,
      authorCompanyLogosList: templateConfig.authorCompanyLogosList,
    });
  };

  return (
    <div className="space-y-4 py-4 w-[360px] flex flex-col h-full">
      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsTemplateCustomization(false)}
        >
          {'<'}-
        </Button>
        <h2 className="font-semibold text-primary/80">
          Template Customization
        </h2>
      </div>
      <Form {...templateForm}>
        <form
          onSubmit={templateForm.handleSubmit(onTemplateFormSubmit)}
          className="flex flex-col justify-between grow"
        >
          <div className="space-y-4">
            <FormField
              control={templateForm.control}
              name="authorName"
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormLabel>Author Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-white"
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={templateForm.control}
              name="authorCompanyName"
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-white"
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={templateForm.control}
              name="authorCompanyLogo"
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormLabel>Company Logo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templateConfig.authorCompanyLogosList.length > 0 ? (
                        templateConfig.authorCompanyLogosList.map(
                          (fileName) => (
                            <SelectItem value={fileName} key={fileName}>
                              <DisplayLogo
                                userId={userId}
                                fileName={fileName}
                              />
                            </SelectItem>
                          ),
                        )
                      ) : (
                        <SelectItem value={defaultCompanyLogo}>
                          <Image
                            src={defaultCompanyLogo}
                            alt="preview image"
                            className="h-10 w-auto bg-zinc-500 rounded-sm p-2 py-1"
                            height={0}
                            width={0}
                            sizes="100vw"
                          />
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={templateForm.control}
              name="colorScheme"
              render={({ field }) => (
                <FormItem className="w-1/2 pr-2">
                  <FormLabel>Color Scheme</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {...templateConfig.colorSchemesList.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex gap-1 w-[120px]">
                            {...color.colors.map((c, i) => (
                              <div
                                key={c + i}
                                style={{ backgroundColor: c }}
                                className="h-5 w-1/3 rounded-sm"
                              ></div>
                            ))}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full gap-4 flex">
            <Button
              className="w-1/2"
              variant="outline"
              onClick={() => {
                templateForm.reset();
              }}
            >
              Reset
            </Button>
            <Button className="w-1/2" type="submit">
              Apply
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
