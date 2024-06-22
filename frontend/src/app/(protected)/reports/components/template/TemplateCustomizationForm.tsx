import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { INCOME_STATEMENT_IBM } from '@/lib/data/income_statement_ibm';
import { EARNINGS_IBM } from '@/lib/data/earnings_ibm';

import { TemplateConfig, TemplateData } from '../../Component';
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
import { createClient } from '@/lib/supabase/client';
import {
  useFileUrl,
  useUpload,
} from '@supabase-cache-helpers/storage-react-query';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { ArrowLeft } from 'lucide-react';
import { DAILY_IBM } from '@/lib/data/daily_imb';
import { ChartWrapper } from '@/lib/templates/charts/ChartWrapper';
import { getTemplateDocxBlob } from '../../utils/getDocxBlob';

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
  templateData,
  setTemplateConfig,
  setIsTemplateCustomization,
}: {
  userId: string;
  templateConfig: TemplateConfig;
  templateData: TemplateData;
  setTemplateConfig: Dispatch<SetStateAction<TemplateConfig | null>>;
  setIsTemplateCustomization: Dispatch<SetStateAction<boolean>>;
}) => {
  const [images, setImages] = useState<Blob[] | null>(null);
  const [isLoading, setLoading] = useState(false);

  const templateForm = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      authorName: templateConfig.authorName,
      authorCompanyName: templateConfig.authorCompanyName,
      colorScheme: templateConfig.colorScheme.id,
      authorCompanyLogo: templateConfig.authorCompanyLogo ?? defaultCompanyLogo,
    },
  });

  const supabase = createClient();

  const { mutateAsync: uploadTemplate } = useUpload(
    supabase.storage.from('saved-templates'),
    {
      buildFileName: () => `${userId}/default/equity-analyst`,
      upsert: true,
    },
  );


  const getPdfFile = useCallback(
    async (newTemplateConfig: TemplateConfig) => {
      if (!images) {
        throw new Error('No chart provided.');
      }

      const companyLogo = await fetch('/acme_logo.jpg').then((res) =>
        res.blob(),
      );

      let authorCompanyLogo;
      if (newTemplateConfig.authorCompanyLogo === defaultCompanyLogo) {
        authorCompanyLogo = await fetch(defaultCompanyLogo).then((res) =>
          res.blob(),
        );
      } else {
        const { data, error } = await supabase.storage
          .from('company-logos')
          .createSignedUrl(
            `${userId}/${newTemplateConfig.authorCompanyLogo}`,
            3600,
          );

        if (!data) throw new Error('Could not find the author logo.');

        authorCompanyLogo = await fetch(data.signedUrl).then((res) =>
          res.blob(),
        );
      }

      try {
        const docxBlob = await getTemplateDocxBlob(
          templateData,
          newTemplateConfig,
          authorCompanyLogo,
          companyLogo,
          images[0],
          images[1],
        );

        const formData = new FormData();
        formData.append('file', docxBlob);

        const pdfBlob = await fetch('/api/convert/', {
          method: 'POST',
          body: formData,
        }).then((res) => res.blob());

        return pdfBlob;
      } catch (err) {
        console.error(err);
        throw new Error('Something when wrong.');
      }
    },
    [templateData, supabase.storage, userId, images],
  );

  const onTemplateFormSubmit = (values: z.infer<typeof templateFormSchema>) => {
    setLoading(true);

    const colorScheme = templateConfig.colorSchemesList.find(
      (scheme) => values.colorScheme === scheme.id,
    );

    if (!colorScheme) {
      throw new Error('Color scheme not found.');
    }

    const newTemplateConfig = {
      authorName: values.authorName,
      authorCompanyName: values.authorCompanyName,
      colorScheme: colorScheme,
      authorCompanyLogo: values.authorCompanyLogo ?? defaultCompanyLogo,
      colorSchemesList: templateConfig.colorSchemesList,
      authorCompanyLogosList: templateConfig.authorCompanyLogosList,
    };

    setTemplateConfig(newTemplateConfig);

    getPdfFile(newTemplateConfig)
      .then((blob) => {
        const pdf = new File([blob], '', { type: 'application/pdf' });
        uploadTemplate({ files: [pdf] });
      })
      .then(() => setLoading(false));
  };

  return (
    <>
      <AlertDialog open={isLoading} onOpenChange={setLoading}>
        <AlertDialogContent className="w-fit">
          <AlertDialogHeader className="flex flex-col items-center">
            <Image
              src="/loading.gif"
              alt="loading image"
              height={60}
              width={60}
            />
            <AlertDialogDescription>
              Updating template configurations...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
      <div className="space-y-4 py-4 w-[360px] flex flex-col h-full">
        <ChartWrapper
          colors={templateConfig.colorScheme.colors}
          targetPrice={182}
          incomeStatement={INCOME_STATEMENT_IBM}
          earnings={EARNINGS_IBM}
          dailyStock={DAILY_IBM}
          setCharts={setImages}
        />
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTemplateCustomization(false)}
          >
            <ArrowLeft className="h-4 w-4" />
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
                      <Input {...field} className="bg-white" />
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
                              className="h-8 w-auto bg-zinc-500 rounded-sm p-2 py-1"
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

            <div className="w-full gap-4 flex justify-center">
              {/* <Button
                className="w-1/2"
                variant="outline"
                onClick={() => {
                  templateForm.reset();
                }}
              >
                Reset
              </Button> */}
              <Button
                className="w-1/2 bg-azure hover:bg-azure/95"
                type="submit"
              >
                Apply
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};
