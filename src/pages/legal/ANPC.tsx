
export const ANPC = () => {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Informații ANPC</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Autoritatea Națională pentru Protecția Consumatorilor</h2>
          <p>
            În conformitate cu legislația în vigoare, consumatorii pot depune reclamații prin intermediul
            platformei SOL (Soluționarea Online a Litigiilor).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Link-uri utile</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <a 
                href="https://anpc.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ANPC - Site Oficial
              </a>
            </li>
            <li>
              <a 
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Platforma SOL (ODR) - Soluționarea online a litigiilor
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
