export function choiceStyle(
  isAnswer: boolean,
  isPicked: boolean,
  isRuledOut: boolean,
  revealed: boolean,
) {
  if (revealed && isAnswer) {
    return "bg-correct text-white";
  }

  if (isPicked || isRuledOut) {
    return "bg-wrong text-white";
  }

  return revealed
    ? "bg-white opacity-50"
    : "bg-white shadow-sticker-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
}
