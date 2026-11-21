import { PulseLoader } from "react-spinners";

type PageLoadingProps = {
  message?: string;
};

export default function PageLoading({
  message = "Carregando...",
}: PageLoadingProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-4">
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm"
      >
        <span aria-hidden="true" className="flex items-center">
          <PulseLoader color="#395CEB" size={9} margin={3} />
        </span>

        <p className="text-secondary-text text-center text-sm font-medium">
          {message}
        </p>
      </div>
    </main>
  );
}
