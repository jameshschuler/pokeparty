type DeleteTeamConfirmProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTeamConfirm({
  onCancel,
  onConfirm,
}: DeleteTeamConfirmProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-semibold">Delete this team?</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          autoFocus
          className="border-ink flex min-h-11 items-center rounded-full border-[3px] bg-white px-4 font-semibold transition active:scale-95"
        >
          Keep
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="border-ink bg-primary shadow-sticker-sm flex min-h-11 items-center rounded-full border-[3px] px-4 font-semibold text-white transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
