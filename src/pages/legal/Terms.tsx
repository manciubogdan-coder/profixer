
export const Terms = () => {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Termeni și Condiții</h1>
      
      <p className="text-muted-foreground">
        Ultima actualizare: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptarea termenilor</h2>
          <p>
            Prin utilizarea acestui site web, acceptați să fiți legat prin acești Termeni și Condiții de utilizare.
            Vă rugăm să citiți cu atenție acești termeni înainte de a utiliza platforma noastră.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Descrierea serviciilor</h2>
          <p>
            ProFixer este o platformă online care facilitează conectarea între meșteri profesioniști și clienți
            care au nevoie de servicii de reparații și întreținere.
          </p>
        </section>

        {/* ... Restul secțiunilor termenilor și condițiilor */}
      </div>
    </div>
  );
};
