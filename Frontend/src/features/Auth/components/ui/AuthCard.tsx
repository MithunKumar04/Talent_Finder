import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

const AuthCard = ({ title, children }: AuthCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default AuthCard;