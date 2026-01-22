import { SignIn } from "@clerk/nextjs";

export default function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        routing="path"
        path="/auth/signin"
        signUpUrl="/auth/signup"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}