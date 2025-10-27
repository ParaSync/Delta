import Card from "@components/Card"
import Logo from "@components/Logo"
import { Email, Password, SubmitButton } from "@components/Forms";

import { useState } from "react"

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex justify-center items-center">
      <Card style="flex flex-col m-5 items-center">
        <Logo size="lg" style="my-3"/>
        <h1 className="font-bold text-xl my-3">
          Welcome back
        </h1>
        <form action="">
          <Email value={email} setValue={setEmail} size="lg"/>
          <Password value={password} setValue={setPassword} size="lg"/>
          <SubmitButton text="Sign in" style="my-3"/>
        </form>

      </Card>

    </div>
  )
}

export default Login
