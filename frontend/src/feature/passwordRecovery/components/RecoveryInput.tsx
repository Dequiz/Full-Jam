import type { ChangeEvent } from "react";

type inputType = "EMAIL" | "NUMBER" | "PASSWORD";

interface Config {
  label: string
  type: inputType
  placeholder: string
  onChange: (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  value?: string
}

const getType = (type: inputType): string => {
  switch (type) {
    case "EMAIL":
      return "email"
    case "NUMBER":
      return "text"
    case "PASSWORD":
      return "password"
  }
}

const getInputMode = (type: inputType) => {
  switch (type) {
    case "EMAIL":
      return "email";
    case "NUMBER":
      return "numeric";
    case "PASSWORD":
      return "text";
  }
}

const RecoveryInput = ({label, type, placeholder, onChange, value}: Config) => {
  return (
    <div className={"mb-3 flex w-full flex-col gap-2.5 text-start"}>
      <label className={"text-base font-bold text-black"}>{label}</label>
      <input
        className={"h-10 w-full rounded-3xl border pl-2"}
        type={getType(type)}
        inputMode={getInputMode(type)}
        placeholder={placeholder}
        autoComplete={type === "EMAIL" || type === "PASSWORD" ? "off" : "one-time-code"}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

export default RecoveryInput;