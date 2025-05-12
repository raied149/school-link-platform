
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth, UserRole } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const roles: UserRole[] = ['admin', 'teacher', 'student', 'parent'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/4567f9ca-ee69-4eae-8105-c08313459a06.png" 
              alt="SlateEd Logo" 
              className="h-16 w-auto" 
            />
            <h1 className="text-3xl font-bold">SlateEd</h1>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Welcome to SlateEd
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Choose your role to continue
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          {roles.map((role) => (
            <Button
              key={role}
              onClick={() => login(role)}
              className="w-full capitalize"
            >
              Login as {role}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
