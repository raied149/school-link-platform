
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TaskGoogleDriveLinkProps {
  googleDriveLink: string;
  setGoogleDriveLink: (link: string) => void;
}

export function TaskGoogleDriveLink({
  googleDriveLink,
  setGoogleDriveLink
}: TaskGoogleDriveLinkProps) {
  const isValidURL = (str: string) => {
    if (!str) return true;
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="googleDriveLink">Google Drive Link (Optional)</Label>
      <Input
        id="googleDriveLink"
        placeholder="https://drive.google.com/..."
        value={googleDriveLink}
        onChange={(e) => setGoogleDriveLink(e.target.value)}
      />
      {googleDriveLink && !isValidURL(googleDriveLink) && (
        <p className="text-sm text-red-500">Please enter a valid URL</p>
      )}
    </div>
  );
}
