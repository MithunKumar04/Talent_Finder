interface ButtonProps {
  text: string;
  type?: "button" | "submit";
}

const Button = ({ text, type = "button" }: ButtonProps) => {
  return (
    <button
      type={type}
      className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 transition-colors"
    >
      {text}
    </button>
  );
};

export default Button;