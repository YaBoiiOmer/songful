"use server";

import { revalidatePath } from "next/cache";
import { SettingsFormSchema } from "./settings-form";
import { updateSettings } from "@/settings";

export async function saveSettingsAction(data: SettingsFormSchema) {
  try {
    const result = await updateSettings(data);
    if (!result) {
      return { success: false, error: "Failed to update settings" };
    }
    if (result.error) {
      return { success: false, error: result.error };
    }
    const { isNewPlaylist, songsLoaded } = result;
    revalidatePath("/settings");
    return { success: true, newPlaylist: isNewPlaylist || false, songsLoaded };
  } catch (err) {
    return { success: false };
  }
}
