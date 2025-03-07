import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // First navigate to sign-in page
      router.push("/sign-in");
      // Then sign out
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="w-64 bg-[#1A1A1A] p-6 flex flex-col items-center">
      <div className="mb-16 flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="mb-16 w-full flex flex-col items-center">
        <div className="w-16 h-16 overflow-hidden mx-auto rounded-full bg-white/10 flex items-center justify-center">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white text-2xl font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="text-center mt-3">
          <div className="text-white/90 text-sm font-medium">
            {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full items-center">
        <Link
          href="/home"
          className="flex items-center gap-3 text-[#CDFF63] px-4 py-2 rounded-lg bg-white/5 text-sm w-48"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Home</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 text-white/80 hover:text-[#CDFF63] px-4 py-2 rounded-lg hover:bg-white/[0.02] text-sm w-48"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4 w-full flex flex-col items-center">
        <div className="flex items-center gap-2 text-white/80 mb-3 text-sm w-48">
          <svg
            className="w-4 h-4"
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
          <span className="truncate">{user?.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-white/80 hover:text-[#CDFF63] px-4 py-2 rounded-lg hover:bg-white/[0.02] text-sm w-48"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
