import { useAuth } from "@/hooks/use-auth";

export default function TournamentsTest() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Tournaments Page Test</h1>
      <p className="mt-4">User: {user?.username || "Not logged in"}</p>
      <p className="mt-2">If you can see this, routing works!</p>
    </div>
  );
}
