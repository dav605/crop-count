import { TokenCreateForm } from "@/components/token-create-form";
import { Separator } from "@/components/ui/separator";

export default function NewTokenPage() {
  return (
    <div className="container py-10 lg:px-80">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">New Farm Asset</h2>
        <p className="text-muted-foreground">
          Register a crop or livestock asset with fractional investment units
        </p>
      </div>
      <Separator className="my-6" />
      <TokenCreateForm />
    </div>
  );
}
