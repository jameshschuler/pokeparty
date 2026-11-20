import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PRIMARY_BUTTON } from "../shared/button-styles";

export function NewPlaythroughButton() {
  return (
    <Link
      to="/playthroughs/new"
      className={`${PRIMARY_BUTTON} shrink-0 justify-center`}
    >
      <Plus className="size-6" aria-hidden />
      New playthrough
    </Link>
  );
}
