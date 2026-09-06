import type { Metadata } from "next";
import { CinematicBackdrop } from "@/components/cinematic-backdrop";
import { LoginForm } from "@/components/auth-forms";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "E-Banking login" };

const LOGIN_CLIPS = [
  "/media/bank-lobby.mp4",
  "/media/office-hall.mp4",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ banned?: string; pending?: string }>;
}) {
  const { banned, pending } = await searchParams;

  return (
    <div className="relative flex min-h-full flex-col">
      <CinematicBackdrop clips={LOGIN_CLIPS} dim="login" className="fixed" />
      <SiteHeader overlay />
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-24">
        <div className="site-login-card rounded-3xl border border-white/20 bg-white/88 p-6 shadow-[0_24px_60px_rgba(8,24,44,0.28)] backdrop-blur-xl sm:p-8">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[#2F7A45] uppercase">
            Secure access
          </p>
          <h1 className="site-display mt-2 text-3xl font-medium text-[#0B2340]">
            E-Banking
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#5C6B64]">
            Sign in to review balances, move money, and manage your Southern
            Ridge membership.
          </p>
          {banned ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              This membership is banned. Login access has been restricted.
            </p>
          ) : null}
          {pending ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              This membership is waiting for operations approval. You can sign
              in after a branch officer activates it.
            </p>
          ) : null}
          <div className="mt-6">
            <LoginForm role="member" />
          </div>
        </div>
      </main>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
