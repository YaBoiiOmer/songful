"use server";

import { revalidatePath } from "next/cache";
import { SettingsFormSchema } from "./settings-form";
import { updatePlaylist } from "@/playlist-creation";

export async function updatePlaylistUrlAction(data: SettingsFormSchema) {
  try {
    const playlist = await updatePlaylist({ url: data.spotifyPlaylistUrl });
    revalidatePath("/settings");
    return { success: true, message: `${playlist.name} playlist updated successfully` };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to save playlist" };
  }
}
