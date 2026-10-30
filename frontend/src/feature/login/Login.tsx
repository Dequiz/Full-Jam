import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div
      className={
        "bg-secondary-background flex min-h-screen w-full items-center justify-center"
      }
    >
      <div className="flex h-170 w-full max-w-4xl rounded-2xl bg-white shadow-md">
        <div
          className={
            "flex w-full flex-col flex-wrap items-center justify-center gap-4"
          }
        >
          <h1 className={"text-4xl font-bold text-black"}>Login</h1>

          <div className={"flex w-full max-w-md flex-col gap-2.5 text-start"}>
            <label className={"text-base font-bold text-black"}>E-mail</label>
            <input
              className={"h-10 w-full rounded-3xl border pl-2"}
              type="email"
              placeholder={"Ex: usuario@gmail.com"}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={"flex w-full max-w-md flex-col gap-2.5 text-start"}>
            <label className={"text-base font-bold text-black"}>Senha</label>
            <input
              className={"h-10 w-full rounded-3xl border pl-2"}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className={
              "bg-accent-color w-full max-w-32 cursor-pointer rounded-3xl pt-2.5 pr-10 pb-2.5 pl-10 text-white"
            }

            onClick={() => navigate("/relatorio")}
          >
            Entrar
          </button>
        </div>
        <div
          className={
            "bg-accent-color flex w-full max-w-80 items-center justify-center rounded-2xl text-center"
          }
        >
          <h2 className={"text-2xl font-bold text-white"}>
            Seja Bem Vindo,
            <br /> Usuário
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Login;
