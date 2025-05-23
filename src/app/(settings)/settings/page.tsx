import { getSettings } from "@/use-cases/settings";
import { SettingsForm } from "./settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      {settings.spotifyPlaylistUrl && (
        <Link
          href="/"
          className="block mb-4 text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to main screen
        </Link>
      )}
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Song Game</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Please configure your settings to continue</p>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
