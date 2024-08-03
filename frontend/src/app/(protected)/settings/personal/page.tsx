'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { fetchSettings } from '@/lib/queries';
import {
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import { useToast } from '@/components/ui/use-toast';
import { signOut } from '../actions';

const authorFormSchema = z.object({
  authorName: z.string().optional(),
});

export default function PersonalInformationPage() {
  const { toast } = useToast();

  const supabase = createClient();
  const [userId, setUserId] = useState('');

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

  const form = useForm<z.infer<typeof authorFormSchema>>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: {
      authorName: data && data.length > 0 ? data[0].author_name ?? '' : '',
    },
  });

  if (!userId || !data || data.length === 0) return;

  async function onSubmit(values: z.infer<typeof authorFormSchema>) {
    if (!userId || !data || data.length === 0) return;

    await update({ user_id: data[0].user_id, author_name: values.authorName });

    toast({ description: 'Successfully updated settings.' });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card x-chunk="dashboard-04-chunk-1">
            <CardHeader>
              <CardTitle>Author Name</CardTitle>
              <CardDescription>
                Enter the name you want to display as the author in the report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Author Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                disabled={form.watch('authorName') === data[0].author_name}
                type="submit"
              >
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
