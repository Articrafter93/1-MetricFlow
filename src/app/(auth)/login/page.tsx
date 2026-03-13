import { Suspense } from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function LoginPage() {
  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div className="text-sm text-text-secondary">Cargando acceso...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}

