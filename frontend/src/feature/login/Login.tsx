import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../../service/authService.ts";
import { PulseLoader } from "react-spinners";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const signIn = async () => {
    if (!email || !password) {
      toast.error("Preencha todos os campos!");
      return;
    }

    setIsLoading(true);

    try {
      await authService.signIn(email, password);
      navigate("/relatorio", { replace: true });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Confirme seu email antes de entrar")
      ) {
        toast.error("Confirme seu email antes de entrar");
      } else {
        toast.error("Login ou senha incorretos");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <label className={"text-base font-bold text-black"}>
              E-mail<span className={"align-top text-xs text-red-500"}> *</span>
            </label>
            <input
              className={"h-10 w-full rounded-3xl border pl-2"}
              type="email"
              placeholder={"Ex: usuario@gmail.com"}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div
            className={"mb-3 flex w-full max-w-md flex-col gap-2.5 text-start"}
          >
            <label className={"text-base font-bold text-black"}>
              Senha
              <span className={"align-top text-xs text-red-500"}> *</span>
            </label>
            <div className={"relative w-full"}>
              <input
                className={"h-10 w-full rounded-3xl border pl-2"}
                type={showPassword ? "text" : "password"}
                placeholder={"Digite sua senha"}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type={"button"}
                onClick={() => setShowPassword((prev) => !prev)}
                className={
                  "absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
                }
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <p className={"w-full max-w-md text-sm"}>
            Leia os nossos{" "}
            <Link
              to="/termos-de-uso"
              className={"text-sm text-blue-500 underline"}
            >
              Termos de Uso
            </Link>{" "}
            e
            <Link
              to="/politica-de-privacidade"
              className={"text-blue-500 underline"}
            >
              {" "}
              Políticas de Privacidade
            </Link>{" "}
            antes de se autenticar no sistema.
          </p>

          <div className={"flex w-full max-w-md flex-col gap-4"}>
            <button
              className={
                "bg-accent-color hover:bg-button-hover hover:text-hover-text cursor-pointer rounded-3xl pt-2.5 pr-10 pb-2.5 pl-10 text-white transition-colors"
              }
              type="button"
              disabled={isLoading}
              onClick={() => signIn()}
            >
              {isLoading ? (
                <PulseLoader color="#ffffff" size={8} margin={1} />
              ) : (
                <p>Entrar</p>
              )}
            </button>

            <button
              className={
                "border-secondary-text text-secondary-text cursor-pointer rounded-3xl border-2 bg-white pt-2.5 pr-10 pb-2.5 pl-10 transition-colors hover:border-black hover:bg-gray-200 hover:text-black"
              }

              onClick={() => navigate("/recuperar-senha")}
            >
              {isLoading ? (
                <PulseLoader color="#ffffff" size={8} margin={1} />
              ) : (
                <p>Recuperar Senha</p>
              )}
            </button>
          </div>
        </div>
        <div
          className={
            "bg-accent-color flex w-full max-w-80 items-center justify-center rounded-2xl text-center"
          }
        >
          <h2 className={"text-2xl font-bold text-white"}>
            Seja Bem Vindo
            <br /> ao Kaysen
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Login;
