
export const Cookies = () => {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Politica de Cookies</h1>
      
      <p className="text-muted-foreground">
        Ultima actualizare: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Ce sunt cookie-urile?</h2>
          <p>
            Cookie-urile sunt fișiere text de mici dimensiuni care sunt stocate pe dispozitivul dumneavoastră
            atunci când vizitați un site web. Acestea sunt utilizate pe scară largă pentru a face site-urile web
            să funcționeze mai eficient și pentru a îmbunătăți experiența utilizatorului.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Cum folosim cookie-urile?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pentru funcționalitatea esențială a site-ului</li>
            <li>Pentru a îmbunătăți experiența utilizatorului</li>
            <li>Pentru analiză și performanță</li>
          </ul>
        </section>

        {/* ... Restul secțiunilor politicii de cookies */}
      </div>
    </div>
  );
};
