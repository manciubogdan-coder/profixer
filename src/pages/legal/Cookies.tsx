
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
            atunci când vizitați site-ul nostru. Acestea sunt utilizate pe scară largă pentru a face site-urile web
            să funcționeze mai eficient și pentru a îmbunătăți experiența utilizatorului.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Ce tipuri de cookie-uri folosim?</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Cookie-uri esențiale</h3>
              <p>Necesare pentru funcționarea site-ului, inclusiv:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Autentificare și menținerea sesiunii</li>
                <li>Preferințele de confidențialitate</li>
                <li>Coșul de cumpărături și procesarea plăților</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Cookie-uri analitice</h3>
              <p>Ne ajută să înțelegem cum este utilizat site-ul:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Statistici despre vizitatori</li>
                <li>Paginile cele mai populare</li>
                <li>Modul în care utilizatorii navighează pe site</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Cookie-uri funcționale</h3>
              <p>Îmbunătățesc experiența utilizatorului:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Salvarea preferințelor</li>
                <li>Personalizarea conținutului</li>
                <li>Integrarea cu rețelele sociale</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Cum puteți controla cookie-urile?</h2>
          <p>
            Puteți controla și/sau șterge cookie-urile după cum doriți. Puteți șterge toate cookie-urile care sunt
            deja pe dispozitivul dumneavoastră și puteți seta majoritatea browserelor să împiedice plasarea acestora.
          </p>
          <p className="mt-2">
            Puteți face acest lucru prin setările browserului dumneavoastră. Consultați secțiunea de ajutor a
            browserului pentru mai multe informații.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Impact asupra funcționalității</h2>
          <p>
            Vă rugăm să rețineți că blocarea tuturor cookie-urilor va avea un impact negativ asupra utilizării
            multor site-uri web. Dacă blocați cookie-urile, nu veți putea utiliza toate funcționalitățile site-ului nostru.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
          <p>
            Pentru orice întrebări despre politica noastră de cookie-uri, vă rugăm să ne contactați la: cookies@profixer.ro
          </p>
        </section>
      </div>
    </div>
  );
};
