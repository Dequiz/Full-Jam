import { useNavigate } from "react-router-dom";

const TermsOfUse = () => {
  const navigation = useNavigate();

  return (
    <div>
      <header>
        <button className={"cursor-pointer"} onClick={() => navigation(-1)}>
          Voltar
        </button>
      </header>
    </div>
  );
};

export default TermsOfUse;
