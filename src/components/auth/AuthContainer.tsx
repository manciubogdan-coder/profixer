import { Navigation } from "@/components/Navigation";

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-secondary p-8 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
};