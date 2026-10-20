import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PILL_BUTTON } from "../shared/button-styles";

export function BackLink({
  to,
  label,
}: {
  to: LinkProps["to"];
  label: string;
}) {
  return (
    <Link to={to} className={PILL_BUTTON}>
      <ArrowLeft className="size-5" aria-hidden />
      {label}
    </Link>
  );
}
