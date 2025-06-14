"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePlaylistUrlAction } from "./setttings.action";
import z from "zod";

const SettingsFormSchema = z.object({
  spotifyPlaylistUrl: z.string().url("Please enter a valid Spotify playlist URL"),
});

export type SettingsFormSchema = z.infer<typeof SettingsFormSchema>;

export function SettingsForm() {
  const form = useForm<SettingsFormSchema>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      spotifyPlaylistUrl: "https://open.spotify.com/playlist/0EBNZWz1zMfEt1h6aIr5mQ?si=c6408babd5e64fd8",
    },
  });

  const onSubmit = async (data: SettingsFormSchema) => {
    updatePlaylistUrlAction(data).then((res) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <>
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
