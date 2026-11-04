type AnyObject = {
  id: string;
};

interface DeleteButtonProps {
  objectToDelete: AnyObject;
  onDelete: (id: string) => void;
}

const DeleteButton = ({ objectToDelete, onDelete }: DeleteButtonProps) => {
  return (
    <button
      onClick={() => onDelete(objectToDelete.id)}
      aria-label="Excluir produto"
      className="group text-destructive-color bg-action-button-bg hover:bg-action-button-delete-hover grid size-8 cursor-pointer place-items-center rounded-lg transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:-translate-y-1"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 fill-current stroke-current stroke-[1.2] transition"
      >
        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Zm3 2v8h2v-8H9Zm4 0v8h2v-8h-2Z" />
      </svg>
    </button>
  );
};

export default DeleteButton;
