'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useDirectory,
  useFileUrl,
  useUpload,
} from '@supabase-cache-helpers/storage-react-query';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DisplayLogo } from './components/DisplayLogo';
import { useToast } from '@/components/ui/use-toast';
import {
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { fetchSettings } from '@/lib/queries';

const companyNameFormSchema = z.object({
  companyName: z.string().optional(),
});

const companyLogoFormSchema = z.object({
  companyLogo: typeof window === 'undefined' ? z.any() : z.instanceof(File),
});

export default function PersonalInformationPage() {
  const { toast } = useToast();

  const supabase = createClient();
  const [userId, setUserId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) {
        setUserId(res.data.user.id);
      }
    });
  }, [supabase.auth]);

  const { data, error } = useQuery(fetchSettings(supabase));

  const { mutateAsync: update } = useUpdateMutation(
    supabase.from('settings'),
    ['user_id'],
    'user_id',
  );

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    setSelectedFile(e.target.files[0]);
  };

  const { data: logos } = useDirectory(
    supabase.storage.from('company-logos'),
    userId,
    { refetchOnWindowFocus: false },
  );

  const { mutateAsync: upload } = useUpload(
    supabase.storage.from('company-logos'),
    { buildFileName: ({ fileName }) => `${userId}/${fileName}` },
  );

  const companyNameForm = useForm<z.infer<typeof companyNameFormSchema>>({
    resolver: zodResolver(companyNameFormSchema),
    defaultValues: {
      companyName: data && data.length > 0 ? data[0].company_name ?? '' : '',
    },
  });

  const companyLogoForm = useForm<z.infer<typeof companyLogoFormSchema>>({
    resolver: zodResolver(companyLogoFormSchema),
  });

  if (!userId || !data || data.length === 0) {
    return;
  }

  async function onCompanyNameSubmit(
    values: z.infer<typeof companyNameFormSchema>,
  ) {
    await update({
      user_id: data![0].user_id,
      company_name: values.companyName,
    });

    toast({ description: 'Successfully updated settings.' });
  }

  function onCompanyLogoSubmit(values: z.infer<typeof companyLogoFormSchema>) {
    console.log('called');
    upload({ files: [values.companyLogo] });

    toast({ description: 'Successfully uploaded a new logo.' });
  }

  return (
    <>
      <Form {...companyNameForm}>
        <form onSubmit={companyNameForm.handleSubmit(onCompanyNameSubmit)}>
          <Card x-chunk="dashboard-04-chunk-1">
            <CardHeader>
              <CardTitle>Company Name</CardTitle>
              <CardDescription>
                Enter the company name you want to display in the report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={companyNameForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Company Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                type="submit"
                disabled={
                  companyNameForm.watch('companyName') === data[0].company_name
                }
              >
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <Form {...companyLogoForm}>
        <form onSubmit={companyLogoForm.handleSubmit(onCompanyLogoSubmit)}>
          <Card x-chunk="dashboard-04-chunk-1">
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>
                Enter the company name you want to display in the report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logos && logos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3>Uploaded Logos</h3>
                  {...logos.map((logo) => (
                    <DisplayLogo
                      key={logo.id}
                      client={supabase}
                      userId={userId}
                      fileName={logo.name}
                    />
                  ))}
                </div>
              )}

              <FormField
                control={companyLogoForm.control}
                name="companyLogo"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Upload a new logo</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          onSelectFile(e);
                          onChange(e.target.files && e.target.files[0]);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedFile && preview && (
                <div className="mt-4 flex items-center gap-6">
                  <Image
                    src={preview}
                    alt="preview image"
                    className="h-12 w-auto bg-zinc-500 rounded-sm p-2 py-1"
                    height={0}
                    width={0}
                    sizes="100vw"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit">Save</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
