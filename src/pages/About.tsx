
export const About = () => {
  return (
    <div className="container py-8 md:py-16">
      <h1 className="text-4xl font-bold mb-8">Despre ProFixer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">
            ProFixer este platforma digitală care revoluționează modul în care găsim și colaborăm cu meseriași profesioniști în România.
          </p>
          <p className="text-lg text-muted-foreground">
            Ne-am propus să simplificăm procesul de găsire a unui meșter de încredere și să oferim o experiență transparentă și sigură pentru ambele părți.
          </p>
        </div>
        <div className="relative h-[300px] rounded-lg overflow-hidden">
          <img 
            src="/platform-preview.jpg" 
            alt="ProFixer Platform" 
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Pentru Clienți</h3>
          <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
            <li>Găsiți rapid meșteri verificați</li>
            <li>Vedeți recenzii și portofolii</li>
            <li>Comunicare directă și sigură</li>
            <li>Sistem de evaluare transparent</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Pentru Meșteri</h3>
          <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
            <li>Profil profesional personalizat</li>
            <li>Acces la clienți verificați</li>
            <li>Gestionare eficientă a proiectelor</li>
            <li>Creșterea vizibilității online</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Beneficii</h3>
          <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
            <li>Economie de timp și efort</li>
            <li>Transparență și siguranță</li>
            <li>Suport dedicat</li>
            <li>Comunitate de profesioniști</li>
          </ul>
        </div>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">Misiunea Noastră</h2>
        <p className="text-muted-foreground">
          ProFixer își propune să devină platforma de referință pentru servicii de reparații și renovări în România, 
          conectând clienții cu cei mai buni meseriași și facilitând colaborări de succes. Credem în puterea 
          tehnologiei de a simplifica procesele tradiționale și în importanța construirii unei comunități bazate 
          pe încredere și profesionalism.
        </p>
      </div>
    </div>
  );
};
