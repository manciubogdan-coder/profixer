
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
            <li>Informații despre profilul profesional (pentru meșteri)</li>
            <li>Istoricul lucrărilor și evaluărilor</li>
            <li>Informații despre plăți și facturare</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Scopurile prelucrării</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Furnizarea serviciilor de intermediere între clienți și meșteri</li>
            <li>Gestionarea contului de utilizator</li>
            <li>Procesarea plăților și a abonamentelor</li>
            <li>Îmbunătățirea serviciilor noastre</li>
            <li>Marketing și comunicări (cu acordul dumneavoastră)</li>
            <li>Prevenirea fraudelor și asigurarea securității</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Temeiul legal pentru prelucrare</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Executarea contractului de utilizare a platformei</li>
            <li>Respectarea obligațiilor legale</li>
            <li>Consimțământul dumneavoastră (pentru marketing)</li>
            <li>Interesele noastre legitime (îmbunătățirea serviciilor)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Perioada de stocare</h2>
          <p>
            Datele dumneavoastră personale sunt păstrate atât timp cât este necesar pentru îndeplinirea scopurilor pentru care au fost colectate,
            cu respectarea procedurilor interne privind retenția datelor, inclusiv a regulilor de arhivare aplicabile.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Drepturile dumneavoastră</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dreptul de acces la date</li>
            <li>Dreptul la rectificare</li>
            <li>Dreptul la ștergerea datelor</li>
            <li>Dreptul la restricționarea prelucrării</li>
            <li>Dreptul la portabilitatea datelor</li>
            <li>Dreptul la opoziție</li>
            <li>Dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrare automată</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
          <p>
            Pentru orice întrebări sau preocupări cu privire la modul în care tratăm și folosim datele dumneavoastră cu caracter personal,
            sau dacă doriți să vă exercitați oricare dintre drepturile dumneavoastră, vă rugăm să ne contactați la adresa de email: privacy@profixer.ro
          </p>
        </section>
      </div>
    </div>
  );
};
