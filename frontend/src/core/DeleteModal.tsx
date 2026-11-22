import { type ReactNode, useEffect, useId, useRef } from "react";

const buttonClass =
  "flex h-[52px] items-center justify-center gap-2 rounded-[10px] px-6 text-[15px] font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

type DeleteModalProps = {
  title: string;
  description?: string;
  warning?: ReactNode;
  confirmLabel: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
};

const DeleteModal = ({
  title,
  description,
  warning,
  confirmLabel,
  isSubmitting,
  onCancel,
  cancelLabel = "Cancelar",
  onConfirm,
  children,
}: DeleteModalProps) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();

    return () => element?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      className="fixed inset-0 m-auto max-h-[90vh] w-[min(95vw,37rem)] overflow-auto rounded-xl bg-white shadow-xl backdrop:bg-black/40"
      onCancel={(event) => {
        event.preventDefault();
        if (!isSubmitting) onCancel();
      }}
    >
      <div className="flex flex-col gap-6 p-8">
        <div>
          <h2 id={headingId} className="text-2xl font-bold">
            {title}
          </h2>

          {description && (
            <p className="text-secondary-text mt-2 text-base">{description}</p>
          )}
        </div>

        {children}

        {warning && (
          <p className="text-destructive-color rounded-lg bg-[#fff1f1] p-4">
            {warning}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t px-8 py-6">
        <button
          type="button"
          autoFocus
          disabled={isSubmitting}
          onClick={onCancel}
          className={`${buttonClass} border-input-stroke text-accent-color border bg-white`}
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void onConfirm()}
          className={`${buttonClass} bg-destructive-color text-white`}
        >
          {isSubmitting ? <span role="status">Aguarde…</span> : confirmLabel}
        </button>
      </div>
    </dialog>
  );
};

type DeleteItemCardProps = {
  image?: string;
  title: ReactNode;
  badge?: ReactNode;
  subtitle?: ReactNode;
  details?: ReactNode;
  aside?: ReactNode;
};

const DeleteItemCard = ({
  image,
  title,
  badge,
  subtitle,
  details,
  aside,
}: DeleteItemCardProps) => (
  <div className="flex items-center gap-5 rounded-lg border border-[#e7ebf3] bg-slate-50 p-5">
    {image && (
      <img
        src={image}
        className="h-17 w-28 rounded-md object-cover"
        alt=""
      />
    )}
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <strong>{title}</strong>
        {badge}
      </div>
      {subtitle && (
        <p className="text-secondary-text text-[13px]">{subtitle}</p>
      )}
      {(details || aside) && (
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-xs">{details}</p>
          {aside && (
            <span className="text-destructive-color text-base font-bold">
              {aside}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

const StatusBadge = ({ active }: { active: boolean | undefined }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs ${
      active
        ? "bg-active-status-bg text-active-status-text"
        : "bg-pending-status-bg text-pending-status-text"
    }`}
  >
    {active ? "Ativo" : "Inativo"}
  </span>
);

export { DeleteModal, DeleteItemCard, StatusBadge };
export default DeleteModal;
