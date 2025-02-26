
export const Privacy = () => {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Politica de Confidențialitate</h1>
      
      <p className="text-muted-foreground">
        Ultima actualizare: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introducere</h2>
          <p>
            Confidențialitatea datelor dumneavoastră cu caracter personal reprezintă una dintre preocupările principale ale ProFixer.
            Acest document are rolul de a vă informa cu privire la prelucrarea datelor dumneavoastră cu caracter personal,
            în contextul utilizării platformei noastre.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Categoriile de date cu caracter personal prelucrate</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nume și prenume</li>
            <li>Adresă de email</li>
            <li>Număr de telefon</li>
            <li>Adresă</li>
          </ul>
        </section>

        {/* ... Restul secțiunilor politicii de confidențialitate */}
      </div>
    </div>
  );
};
