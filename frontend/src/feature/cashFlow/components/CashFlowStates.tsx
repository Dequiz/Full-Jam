import { PulseLoader } from "react-spinners";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10">
      <PulseLoader color="#395CEB" size={10} />
      <p className="text-secondary-text text-[13px]">
        Carregando movimentações...
      </p>
    </div>
  );
}

type LoadErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function LoadErrorState({ message, onRetry }: LoadErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-destructive-color text-[13px]">
        Não foi possível carregar as movimentações ({message}).
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-accent-color cursor-pointer text-[13px] font-semibold underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}
