interface AuthHeaderProps {
  isLogin: boolean;
}

export const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-primary">
        {isLogin ? "Bine ați revenit" : "Creați un cont nou"}
      </h2>
      <p className="text-secondary-foreground mt-2">
        {isLogin
          ? "Autentificați-vă în contul dumneavoastră"
          : "Înregistrați-vă ca client sau profesionist"}
      </p>
    </div>
  );
};