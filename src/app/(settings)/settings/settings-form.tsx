"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "@/settings";
import { toast } from "sonner";
import { saveSettingsAction } from "./setttings.action";
import z from "zod";
import { useState } from "react";
import DownloadProgressDialog from "./download-dialog";

const SettingsFormSchema = z.object({
  spotifyPlaylistUrl: z.string().url("Please enter a valid Spotify playlist URL"),
});

export type SettingsFormSchema = z.infer<typeof SettingsFormSchema>;

interface SettingsFormProps {
  settings: Settings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const form = useForm<SettingsFormSchema>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      spotifyPlaylistUrl: settings.spotifyPlaylistUrl,
    },
  });

  const onSubmit = async (data: SettingsFormSchema) => {
    const res = await saveSettingsAction(data);
    if (res.success) {
      toast.success("Settings saved successfully");
      if (res.newPlaylist) {
        setIsDownloadDialogOpen(true);
      }
    } else {
      toast.error("Failed to save settings");
    }
  };

  return (
    <>
      <DownloadProgressDialog isOpen={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="spotifyPlaylistUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spotify Playlist URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://open.spotify.com/playlist/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save Settings
          </Button>
        </form>
      </Form>
    </>
  );
}
