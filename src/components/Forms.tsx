import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

type formProps = {
  value: string;
  setValue: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

type inputContainerProps = {
  children: ReactNode;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function InputContainer({ children, name, size = 'md' }: inputContainerProps){
  return(
    <div className={`relative  ${size === 'lg' ? 'w-96' : size === 'md' ? 'w-80' : 'w-64'}`}>
        <label htmlFor="password" className={`block font-medium mb-1 
          ${size === 'lg' ? 'text-md' : size === 'md' ? 'text-s' : 'text-xs'}`}>
            {name}
        </label>
        {children}
    </div>
  );
}

export function Password ({ value: password, setValue: setPassword, size = 'md' }: formProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <InputContainer name="Password" size={size}>
        <div>
          <input
            type= {showPassword ? "text" : "password"}
            id="password"
            name="password"
            className=" w-full rounded-md border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <Eye/> : <EyeOff/>}
          </button>
        </div>
      </InputContainer>
    </>
  )
}

export function Email ({ value: email, setValue: setEmail, size = 'md' }: formProps) {
  return (
    <>
      <InputContainer name="E-mail" size={size}>
        <input
          type="text"
          id="email" name="email"
          value={email} onChange={(e) => setEmail(e.target.value)} 
          className="w-full rounded-md border p-2"
          required 
        />
      </InputContainer>
    </>
  )
}
