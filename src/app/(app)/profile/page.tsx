import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Business profile
        </h1>
        <p className="text-sm text-muted-foreground">
          These details auto-fill on every new invoice. All fields are optional
          — save as much or as little as you like.
        </p>
      </header>

      <Card className="border-0 bg-card shadow-sm ring-1 ring-foreground/10">
        <CardHeader className="border-b border-border pb-6">
          <CardTitle className="text-lg">Your business</CardTitle>
          <CardDescription>
            Identity, contact information, and invoice defaults in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProfileForm profile={user.profile} />
        </CardContent>
      </Card>
    </div>
  );
}
