import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function AuthField({ label, type, ...inputProps }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={inputProps.id}>
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          type={isPassword && showPassword ? 'text' : type}
          className={`h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 ${isPassword ? 'pr-9' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
            // Inline so the global `button` rules in index.css (padding, hover shadow/lift) don't apply.
            style={{ padding: 0, background: 'transparent', boxShadow: 'none', transform: 'none' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">{children}</div>
  );
}

export function AuthSuccess({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#15803d]">{children}</div>
  );
}

export function AuthSubmitButton({ children, ...buttonProps }) {
  return (
    <button
      {...buttonProps}
      type="submit"
      className="mt-2 h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AuthLinkRow({ children }) {
  return <p className="mt-4 text-center text-sm text-muted-foreground">{children}</p>;
}
