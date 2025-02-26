
export const GDPR = () => {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Politica GDPR</h1>
      
      <p className="text-muted-foreground">
        Ultima actualizare: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Drepturile dumneavoastră conform GDPR</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dreptul de a fi informat</li>
            <li>Dreptul de acces</li>
            <li>Dreptul la rectificare</li>
            <li>Dreptul la ștergere</li>
            <li>Dreptul la restricționarea prelucrării</li>
            <li>Dreptul la portabilitatea datelor</li>
            <li>Dreptul de opoziție</li>
            <li>Drepturi legate de luarea automată a deciziilor</li>
          </ul>
        </section>

        {/* ... Restul secțiunilor politicii GDPR */}
      </div>
    </div>
  );
};
