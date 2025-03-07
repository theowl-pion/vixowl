import React from "react";
import Link from "next/link";

interface EmailVerificationModalProps {
  email: string;
  onClose: () => void;
}

export default function EmailVerificationModal({
  email,
  onClose,
}: EmailVerificationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full border border-white/10">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#CDFF63]/20 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#CDFF63]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-white/70 mb-4">
            We've sent a verification email to{" "}
            <span className="text-[#CDFF63] font-medium">{email}</span>
          </p>
          <p className="text-white/70 mb-6">
            Please check your inbox and click the verification link to complete
            your registration.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/sign-in"
            className="block w-full py-2 px-4 bg-[#CDFF63] hover:bg-[#CDFF63]/90 text-black font-medium rounded-lg text-center transition duration-200"
          >
            Go to Sign In
          </Link>
          <button
            onClick={onClose}
            className="block w-full py-2 px-4 bg-transparent border border-white/20 hover:border-white/40 text-white font-medium rounded-lg text-center transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
