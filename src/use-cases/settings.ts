import { APP_CONFIG } from "@/config";
import fs from "fs";

export interface Settings {
  spotifyPlaylistUrl: string;
}

const defaultSettings: Settings = {
  spotifyPlaylistUrl: "",
};

let settings: Settings = await loadSettings();

async function loadSettings() {
  try {
    if (!fs.existsSync(APP_CONFIG.settingsPath)) {
      fs.writeFileSync(APP_CONFIG.settingsPath, JSON.stringify(defaultSettings, null, 2));
    }
    const settingsFile = fs.readFileSync(APP_CONFIG.settingsPath, "utf8");
    return JSON.parse(settingsFile) as Settings;
  } catch (error) {
    console.error("Failed to get settings, returning default settings:", error);
    return defaultSettings;
  }
}

export async function updateSettings(newSettings: Settings) {
  try {
    fs.writeFileSync(APP_CONFIG.settingsPath, JSON.stringify(newSettings, null, 2));
    settings = newSettings;
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export async function getSettings() {
  if (!settings) {
    settings = await loadSettings();
  }
  return settings;
}
