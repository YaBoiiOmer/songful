import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";

export default function SettingsButton() {
  return (
    <Button variant="outline" size="icon" className="absolute top-4 right-4">
      <Link href="/settings">
        <Settings />
      </Link>
    </Button>
  );
}
