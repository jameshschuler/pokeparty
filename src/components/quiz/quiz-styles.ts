export function choiceStyle(
  isAnswer: boolean,
  isPicked: boolean,
  revealed: boolean,
) {
  if (!revealed) {
    return "bg-white shadow-sticker-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
  }

  if (isAnswer) {
    return "bg-correct text-white";
  }

  return isPicked ? "bg-wrong text-white" : "bg-white opacity-50";
}
