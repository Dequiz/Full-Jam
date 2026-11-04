
type AnyObject = {
  id: string
}

interface EditButtonProps {
  objectToEdit: AnyObject
  onEdit: (id: string) => void
}

const EditButton = ({ objectToEdit, onEdit }: EditButtonProps) => {
  return (
    <button
      onClick={() => onEdit(objectToEdit.id)}
      aria-label="Editar produto"
      className="group text-accent-color grid size-8 cursor-pointer place-items-center rounded-lg bg-action-button-bg transition duration-200 hover:-translate-y-1 hover:bg-action-button-edit-hover hover:shadow-md focus-visible:-translate-y-1"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 fill-current stroke-current stroke-[1.2] transition"
      >
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.41l-2.51-2.51a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2-1.66Z" />
      </svg>
    </button>
  );
};

export default EditButton;