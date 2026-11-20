import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PILL_BUTTON } from "../shared/button-styles";

type BackLinkProps = Pick<LinkProps, "to" | "params"> & {
  label: string;
};

export function BackLink({ to, params, label }: BackLinkProps) {
  return (
    <Link to={to} params={params} className={PILL_BUTTON}>
      <ArrowLeft className="size-5" aria-hidden />
      {label}
    </Link>
  );
}
