import { Link } from "@tanstack/react-router";
import { House } from "lucide-react";
import { PILL_BUTTON } from "./button-styles";

export function MainMenuLink() {
  return (
    <Link to="/" className={PILL_BUTTON}>
      <House className="size-5" aria-hidden />
      Main menu
    </Link>
  );
}
