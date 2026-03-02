import { useState } from "react";
import AuthCard from "../ui/AuthCard";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

const LoginForm = () => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <AuthCard title="Login">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" text="Sign In" />
      </form>
    </AuthCard>
  );
};

export default LoginForm;