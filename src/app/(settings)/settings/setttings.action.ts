"use server";

import { revalidatePath } from "next/cache";
import { SettingsFormSchema } from "./settings-form";
import { updateSettings } from "@/settings";

export async function saveSettingsAction(data: SettingsFormSchema) {
  try {
    const newPlaylist = await updateSettings(data);
    revalidatePath("/settings");
    return { success: true, newPlaylist: newPlaylist || false };
  } catch (err) {
    return { success: false };
  }
}
