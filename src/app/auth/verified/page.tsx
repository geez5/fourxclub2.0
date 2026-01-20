import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Email Verified!</h2>
        <p className="text-gray-600 mb-8">
          You can now sign in to your account
        </p>
        <Link href="/auth/signin" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Sign In Now
        </Link>
      </div>
    </div>
  );
}