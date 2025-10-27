import Card from "@components/Card"
import Logo from "@components/Logo"
import { Email, Password } from "@components/Forms";

import { useState } from "react"

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex justify-center items-center">
      <Card style="flex flex-col m-5">
        <Logo size="lg"/>
        <span>Welcome Back!</span>
          <Email value={email} setValue={setEmail} size="lg"/>
          <Password value={password} setValue={setPassword} size="lg"/>
      </Card>

    </div>
  )
}

export default Login
