import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { authService } from "../../service/authService.ts";
import RecoveryInput from "./components/RecoveryInput.tsx";
import RecoveryButton from "./components/RecoveryButton.tsx";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentCode, setSentCode] = useState(false);
  const [validatedCode, setValidatedCode] = useState(false);
  const navigation = useNavigate();

  const sendRecuperationCode = async () => {
    if (!email) {
      toast.error("Preencha o campo de email");
      return;
    }

    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSentCode(true);
    } catch (error) {
      toast.error(
        "Não foi possível enviar o código. Verifique sua conexão e tente novamente!",
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpCode = async () => {
    if (!code) {
      toast.error("Insira o código recebido no campo!");
      return;
    }

    setIsLoading(true);

    try {
      await authService.verifyOtpForResetPassword(email, code);
      setValidatedCode(true);
      setSentCode(false);
    } catch (error) {
      toast.error(`Erro: ${error}`);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword) {
      toast.error("Preencha o campo de senha com sua nova senha!");
      return;
    }

    setIsLoading(true);

    try {
      await authService.updatePasswordWithCode(newPassword);
      toast.success("Senha atualizada com sucesso!");
      setValidatedCode(false);
      navigation(-1);
    } catch (error) {
      toast.error(`Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const value = e.target.value;

    if (/^\d*$/.test(value) && value.length <= 8) {
      setCode(value);
    }
  };

  return (
    <div
      className={
        "bg-secondary-background flex min-h-screen w-full items-center justify-center"
      }
    >
      <div
        className={
          "flex w-full max-w-3xl flex-col gap-5 rounded-2xl bg-white px-12 py-12 shadow-md"
        }
      >
        <div className={"w-full justify-self-start"}>
          <button
            className={
              "hover:bg-accent-color cursor-pointer rounded-lg border-2 border-black px-4 py-1 text-black hover:border-white hover:text-white"
            }
            onClick={() => navigation(-1)}
          >
            <span className={"text-xl"}>&larr;</span>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-5">
          <h1 className={"text-4xl font-bold text-black"}>Recuperar Senha</h1>

          {!sentCode && !validatedCode && (
            <>
              <p className="text-secondary-text mb-2 text-sm">
                Para recuperar a sua senha, informe seu endereço de email que
                nós enviaremos um código de 8 dígitos para a alteração da sua
                senha.
              </p>

              <RecoveryInput
                label={"E-mail"}
                type={"EMAIL"}
                placeholder={"Ex: usuario@gmail.com"}
                onChange={(e) => setEmail(e.target.value)}
              />

              <RecoveryButton
                isLoading={isLoading}
                buttonText={"Enviar código de recuperação"}
                onClick={sendRecuperationCode}
              />
            </>
          )}

          {sentCode && (
            <>
              <p className="text-secondary-text text-sm">
                Digite o código de 8 dígitos recebido no email no input de texto
                abaixo para recuperar a sua senha.
              </p>

              <RecoveryInput
                label={"Código"}
                type={"NUMBER"}
                placeholder={"ex: 14234596"}
                onChange={handleChange}
                value={code}
              />

              <RecoveryButton
                isLoading={isLoading}
                buttonText={"Verificar código de recuperação"}
                onClick={verifyOtpCode}
              />
            </>
          )}

          {validatedCode && (
            <>
              <p className="text-secondary-text text-sm">
                Quase lá! Escolha uma nova senha para voltar a acessar sua
                conta.
              </p>

              <RecoveryInput
                label={"Nova senha"}
                type={"PASSWORD"}
                placeholder={"Digite sua nova senha"}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <RecoveryButton
                isLoading={isLoading}
                buttonText={"Atualizar senha"}
                onClick={updatePassword}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
