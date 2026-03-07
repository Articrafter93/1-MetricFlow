import { Suspense } from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#17253a,_#070b14_45%)] px-4">
      <Suspense fallback={<div className="text-sm text-slate-300">Cargando acceso...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
