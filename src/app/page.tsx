"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadSong } from "./action";
import { toast } from "sonner";
import { useTransition } from "react";

const DownloadSongSchema = z.object({
  url: z.string().url(),
});

export default function Home() {
  const [isDownloading, startTransition] = useTransition();
  const form = useForm<z.infer<typeof DownloadSongSchema>>({
    resolver: zodResolver(DownloadSongSchema),
    defaultValues: {
      url: "",
    },
  });

  const onDownload = async (data: z.infer<typeof DownloadSongSchema>) => {
    startTransition(async () => {
      const result = await downloadSong(data.url);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="w-screen h-screen">
      <div className="flex flex-col items-center justify-center h-full gap-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">Song Downloader</h1>
          <h2 className="text-2xl font-semibold">Download your favorite songs from YouTube</h2>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onDownload)} className="flex flex-col gap-4 w-96">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isDownloading}>
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
