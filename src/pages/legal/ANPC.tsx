
export const ANPC = () => {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Informații ANPC</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Autoritatea Națională pentru Protecția Consumatorilor</h2>
          <p className="mb-4">
            În conformitate cu legislația în vigoare, consumatorii pot depune reclamații prin intermediul
            platformei SOL (Soluționarea Online a Litigiilor).
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Informații de contact ANPC:</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Telefonul consumatorului: 021 9551</li>
                <li>Website: <a href="http://www.anpc.gov.ro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.anpc.gov.ro</a></li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Platforma SOL (Soluționarea Online a Litigiilor)</h2>
          <p className="mb-4">
            În cazul în care doriți să depuneți o reclamație privind un produs sau serviciu achiziționat de la noi prin intermediul site-ului,
            puteți utiliza platforma europeană de soluționare online a litigiilor.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Link-uri importante:</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <a 
                    href="https://anpc.ro/ce-este-sol/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Informații despre SOL (Soluționarea Online a Litigiilor)
                  </a>
                </li>
                <li>
                  <a 
                    href="https://ec.europa.eu/consumers/odr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Platforma SOL a Uniunii Europene
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Drepturi și Obligații</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Drepturile consumatorului:</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Dreptul de a fi informat corect și complet asupra serviciilor</li>
                <li>Dreptul de a beneficia de servicii de calitate</li>
                <li>Dreptul la despăgubiri pentru prejudiciile cauzate</li>
                <li>Dreptul de a sesiza autoritățile competente</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold">Obligațiile noastre:</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Să furnizăm servicii de calitate</li>
                <li>Să respectăm drepturile consumatorilor</li>
                <li>Să oferim informații complete și corecte</li>
                <li>Să soluționăm reclamațiile în mod prompt și eficient</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            Pentru orice reclamații sau sesizări, vă rugăm să ne contactați mai întâi pe noi la adresa de email: 
            <a href="mailto:suport@profixer.ro" className="text-primary hover:underline ml-1">
              suport@profixer.ro
            </a>
          </p>
          <p className="mt-2">
            Vom face tot posibilul să rezolvăm orice problemă în mod amiabil și în cel mai scurt timp posibil.
          </p>
        </section>
      </div>
    </div>
  );
};
