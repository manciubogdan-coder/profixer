
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
            <li>Dreptul de a fi informat despre modul în care sunt utilizate datele dumneavoastră</li>
            <li>Dreptul de acces la datele personale</li>
            <li>Dreptul la rectificarea datelor incorecte</li>
            <li>Dreptul la ștergerea datelor ("dreptul de a fi uitat")</li>
            <li>Dreptul la restricționarea prelucrării</li>
            <li>Dreptul la portabilitatea datelor</li>
            <li>Dreptul de opoziție la prelucrarea datelor</li>
            <li>Drepturi legate de luarea automată a deciziilor și profilare</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Cum vă exercitați drepturile</h2>
          <p>Pentru a vă exercita oricare dintre drepturile de mai sus, puteți:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Contacta Responsabilul nostru cu Protecția Datelor la gdpr@profixer.ro</li>
            <li>Utiliza formularul de contact din contul dumneavoastră</li>
            <li>Trimite o cerere scrisă la adresa noastră oficială</li>
          </ul>
          <p className="mt-4">
            Vom răspunde la cererea dumneavoastră în termen de 30 de zile. În cazuri complexe,
            acest termen poate fi prelungit cu încă 60 de zile.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Temeiurile legale pentru prelucrarea datelor</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Consimțământul</h3>
              <p>Pentru activități precum:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Trimiterea de comunicări de marketing</li>
                <li>Utilizarea cookie-urilor non-esențiale</li>
                <li>Colectarea de feedback și testimoniale</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Executarea contractului</h3>
              <p>Pentru:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionarea contului de utilizator</li>
                <li>Procesarea plăților</li>
                <li>Furnizarea serviciilor platformei</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Obligația legală</h3>
              <p>Pentru:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Păstrarea înregistrărilor fiscale</li>
                <li>Răspunsul la solicitările autorităților</li>
                <li>Prevenirea fraudelor</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Măsuri de securitate</h2>
          <p>
            Am implementat măsuri tehnice și organizatorice adecvate pentru a asigura un nivel de securitate
            corespunzător riscului prelucrării datelor personale, inclusiv:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Criptarea datelor în tranzit și în repaus</li>
            <li>Procese regulate de backup și recuperare</li>
            <li>Testare regulată a eficacității măsurilor de securitate</li>
            <li>Instruirea personalului privind protecția datelor</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Transfer internațional de date</h2>
          <p>
            Datele dumneavoastră sunt stocate și procesate în Uniunea Europeană. În cazul în care este necesar
            să transferăm date în afara UE, ne asigurăm că există garanții adecvate conform GDPR.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Actualizări ale politicii</h2>
          <p>
            Această politică poate fi actualizată periodic pentru a reflecta modificările în practicile noastre
            de prelucrare a datelor sau modificările legislative. Vă vom notifica despre orice modificări semnificative.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
          <p>
            Pentru orice întrebări sau preocupări legate de prelucrarea datelor dumneavoastră personale,
            vă rugăm să contactați Responsabilul nostru cu Protecția Datelor la: gdpr@profixer.ro
          </p>
        </section>
      </div>
    </div>
  );
};
