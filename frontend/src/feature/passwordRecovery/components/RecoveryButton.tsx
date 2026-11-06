import { PulseLoader } from "react-spinners";

interface Config {
  isLoading: boolean;
  buttonText: string;
  onClick: () => void;
}

const RecoveryButton = ({ isLoading, buttonText, onClick }: Config) => {
  return (
    <button
      type="button"
      disabled={isLoading}
      className={
        "bg-accent-color hover:bg-button-hover hover:text-hover-text w-full cursor-pointer rounded-3xl pt-2.5 pb-2.5 font-medium text-white transition-colors"
      }
      onClick={onClick}
    >
      {isLoading ? (
        <PulseLoader color="#ffffff" size={8} margin={1} />
      ) : (
        <p>{buttonText}</p>
      )}
    </button>
  );
};

export default RecoveryButton;
