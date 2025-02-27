
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Despre Noi</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                  Despre ProFixer
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Politica de Confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-sm text-muted-foreground hover:text-primary">
                  Politica GDPR
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary">
                  Politica de Cookies
                </Link>
              </li>
              <li>
                <Link to="/anpc" className="text-sm text-muted-foreground hover:text-primary">
                  ANPC
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <a 
                  href="https://anpc.ro/ce-este-sol/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img 
                    src="/lovable-uploads/fe8d1cfc-5531-441a-888e-cf9babdd7069.png" 
                    alt="ANPC - Soluționarea Alternativă a Litigiilor" 
                    className="h-16 object-contain"
                  />
                </a>
                <a 
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img 
                    src="/lovable-uploads/8fe99ebc-6d24-4c85-b4fb-c876baacad95.png" 
                    alt="Soluționarea Online a Litigiilor" 
                    className="h-16 object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ProFixer. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/anpc" className="text-sm text-muted-foreground hover:text-primary">
              ANPC Info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
