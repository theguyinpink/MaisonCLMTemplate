import { Suspense } from "react";
import AuthClientPage from "./AuthClientPage";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthClientPage />
    </Suspense>
  );
}