import { SHEET, SHEET_HEADING } from "./nature-dex-styles";

export function NatureTips() {
  return (
    <section className={SHEET}>
      <h2 className={SHEET_HEADING}>Getting natures in H&amp;S</h2>
      <ol className="flex max-w-prose list-decimal flex-col gap-2 pl-5 text-sm [&_b]:font-bold">
        <li>
          <b>Nature Mints.</b> The Goldenrod City Flower Shop sells a Mint for
          every nature after you beat Whitney, ₽20,000 each. A Mint changes the
          stat effect without hunting.
        </li>
        <li>
          <b>Synchronize lead.</b> H&amp;S uses the modern rule: with a
          Synchronize Pokémon first in your party, wild Pokémon always share its
          nature. Gift Pokémon are excluded. Abra on Routes 34 and 35 can have
          Synchronize.
        </li>
        <li>
          <b>Everstone breeding.</b> A parent holding an Everstone always passes
          its nature to the egg. Either parent works, including Ditto.
        </li>
        <li>
          <b>Static encounters.</b> Run away and re-enter to reroll the nature.
          Mew, Deoxys and the first Celebi are the exceptions. Reloading a save
          state replays the same seed, so it rarely helps.
        </li>
        <li>
          <b>Evolve freely.</b> Nature never changes on evolution. An Adamant
          Magikarp becomes an Adamant Gyarados.
        </li>
      </ol>
    </section>
  );
}
