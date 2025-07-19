import React from "react";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      className={`rounded-md bg-[#316cf4] px-6 py-0.5 text-white hover:bg-[#316cf4]/90 disabled:bg-gray-400 transition-all ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
