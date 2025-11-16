import Link from "next/link";

import { getSessionRole } from "@/lib/devAuth";

export default function DevAuthInfoPage() {
  const role = getSessionRole();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-plSkyLight to-white p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-10 space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Local Access Enabled</h1>
        <p className="text-sm text-gray-600 leading-6">
          Clerk authentication is disabled in this development build. All routes are accessible
          without signing in. The current mock role is <span className="font-semibold">{role}</span>.
        </p>
        <p className="text-sm text-gray-600 leading-6">
          To explore the dashboard as another role, set <code className="px-2 py-1 bg-gray-100 rounded">DEV_ROLE</code>
          in <code className="px-2 py-1 bg-gray-100 rounded">.env.local</code> (e.g. <code className="px-2 py-1 bg-gray-100 rounded">DEV_ROLE=teacher</code>)
          and restart the dev server.
        </p>
        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <Link href="/admin" className="px-4 py-2 rounded-md bg-plSky text-white">
            Go to Admin Dashboard
          </Link>
          <Link href="/list/teachers" className="px-4 py-2 rounded-md bg-plPurple text-white">
            Browse Lists
          </Link>
        </div>
      </div>
    </div>
  );
}
