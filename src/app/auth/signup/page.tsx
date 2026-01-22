import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
        routing="path"
        path="/auth/signup"
        signInUrl="/auth/signin"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}