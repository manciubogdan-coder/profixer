
export const Contact = () => {
  return (
    <div className="container py-8 md:py-16">
      <h1 className="text-4xl font-bold mb-8">Contact</h1>
      
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xl text-muted-foreground">
          Pentru orice întrebări sau asistență, ne puteți contacta la adresa de email:
        </p>
        
        <a 
          href="mailto:office@profixer.ro" 
          className="text-2xl font-semibold text-primary hover:underline inline-block"
        >
          office@profixer.ro
        </a>
        
        <p className="text-muted-foreground mt-8">
          Echipa noastră vă va răspunde în cel mai scurt timp posibil, de regulă în maxim 24 de ore lucrătoare.
        </p>
      </div>
    </div>
  );
};
