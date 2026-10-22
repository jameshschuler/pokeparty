import type { ReactNode } from "react";
import { MainMenuLink } from "../shared/MainMenuLink";
import { CopyLinkButton } from "./CopyLinkButton";
import { ShareButton } from "./ShareButton";

type ResultCardProps = {
  title: string;
  url: string;
  shareTitle: string;
  playLink: ReactNode;
  children: ReactNode;
};

export function ResultCard({
  title,
  url,
  shareTitle,
  playLink,
  children,
}: ResultCardProps) {
  return (
    <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      {children}
      <div className="flex items-center gap-3">
        <CopyLinkButton url={url} />
        <ShareButton url={url} title={shareTitle} />
      </div>
      {playLink}
      <MainMenuLink />
    </section>
  );
}
