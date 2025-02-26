
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
            Prin utilizarea platformei ProFixer, acceptați să fiți legat prin acești Termeni și Condiții de utilizare.
            Vă rugăm să citiți cu atenție acești termeni înainte de a utiliza serviciile noastre.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Descrierea serviciilor</h2>
          <p>
            ProFixer este o platformă online care facilitează conectarea între meșteri profesioniști și clienți
            care au nevoie de servicii de reparații și întreținere. Platforma noastră oferă:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Sistem de creare și gestionare a profilurilor pentru meșteri</li>
            <li>Sistem de postare și gestionare a lucrărilor pentru clienți</li>
            <li>Sistem de evaluare și feedback</li>
            <li>Sistem de mesagerie între utilizatori</li>
            <li>Sistem de plăți și abonamente pentru meșteri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Conturi de utilizator</h2>
          <p>Pentru a utiliza serviciile ProFixer, trebuie să creați un cont de utilizator. Sunteți responsabil pentru:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Menținerea confidențialității datelor de autentificare</li>
            <li>Toate activitățile care au loc în contul dumneavoastră</li>
            <li>Furnizarea de informații corecte și actualizate</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Reguli de utilizare</h2>
          <p>Utilizatorii platformei ProFixer trebuie să respecte următoarele reguli:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Să nu furnizeze informații false sau înșelătoare</li>
            <li>Să nu hărțuiască sau să abuzeze alți utilizatori</li>
            <li>Să nu încalce drepturile de proprietate intelectuală</li>
            <li>Să respecte legislația în vigoare</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Tarife și plăți</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utilizarea platformei este gratuită pentru clienți</li>
            <li>Meșterii trebuie să aibă un abonament activ pentru a accesa toate funcționalitățile</li>
            <li>Plățile se procesează prin intermediul unui processor de plăți autorizat</li>
            <li>Toate prețurile afișate includ TVA</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Răspundere și garanții</h2>
          <p>
            ProFixer acționează doar ca intermediar între meșteri și clienți. Nu suntem responsabili pentru:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Calitatea serviciilor prestate de meșteri</li>
            <li>Disputele între utilizatori</li>
            <li>Pagubele directe sau indirecte rezultate din utilizarea platformei</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Modificări ale termenilor</h2>
          <p>
            Ne rezervăm dreptul de a modifica acești termeni în orice moment. Modificările vor intra în vigoare
            imediat după publicarea lor pe platformă. Continuarea utilizării platformei după publicarea modificărilor
            constituie acceptarea acestora.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p>
            Pentru orice întrebări sau probleme legate de acești termeni, vă rugăm să ne contactați la: terms@profixer.ro
          </p>
        </section>
      </div>
    </div>
  );
};
