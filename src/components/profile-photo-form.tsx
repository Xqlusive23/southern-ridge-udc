"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { FormButton } from "@/components/form-button";
import { MemberPhoto } from "@/components/member-photo";
import { StatusBanner } from "@/components/status-banner";
import { uploadProfilePhotoAction } from "@/lib/actions/member";

export function ProfilePhotoForm({
  photoPath,
  initials,
  name,
}: {
  photoPath?: string | null;
  initials: string;
  name: string;
}) {
  const [state, action] = useActionState(uploadProfilePhotoAction, null);

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="size-24 overflow-hidden rounded-full bg-[#0B2340] text-lg font-medium text-[#F4E7C5]">
        <MemberPhoto photoPath={photoPath} initials={initials} alt={name} />
      </div>
      <div className="grid gap-2">
        <StatusBanner error={state?.error} />
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-[#0B2340]">Profile photo</span>
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0B2340] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
          />
        </label>
        <p className="text-xs text-[#8A938C]">
          JPEG, PNG, or WebP up to 2 MB. This photo appears on Overview and Profile.
        </p>
        <FormButton className="h-9 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
          Upload photo
        </FormButton>
      </div>
    </form>
  );
}
