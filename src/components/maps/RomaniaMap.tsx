
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface CountyData {
  total: number;
  clients: number;
  craftsmen: number;
}

interface RomaniaMapProps {
  countiesData: Record<string, CountyData>;
}

const RomaniaMap = ({ countiesData }: RomaniaMapProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Creăm elementul pentru tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "absolute z-50 bg-background/90 border border-border p-3 rounded-md shadow-lg text-sm hidden";
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    return () => {
      // Curățăm tooltip-ul la unmount
      if (tooltip && document.body.contains(tooltip)) {
        document.body.removeChild(tooltip);
      }
    };
  }, []);

  const getCountyFill = (countyName: string) => {
    const countyData = countiesData[countyName];
    if (!countyData) return "rgba(156, 163, 175, 0.2)"; // Gri pentru județe fără date
    
    const total = countyData.total;
    
    if (total > 100) return "rgba(147, 51, 234, 0.8)"; // >100 utilizatori
    if (total > 50) return "rgba(147, 51, 234, 0.6)";  // 51-100 utilizatori
    if (total > 10) return "rgba(147, 51, 234, 0.4)";  // 11-50 utilizatori
    return "rgba(147, 51, 234, 0.2)";                  // 1-10 utilizatori
  };

  const handleCountyMouseEnter = (event: React.MouseEvent<SVGPathElement>, countyName: string) => {
    const county = countiesData[countyName];
    if (!county || !tooltipRef.current) return;

    tooltipRef.current.innerHTML = `
      <div class="font-medium">${countyName}</div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
        <span class="text-muted-foreground">Total:</span>
        <span>${county.total}</span>
        <span class="text-muted-foreground">Clienți:</span>
        <span>${county.clients}</span>
        <span class="text-muted-foreground">Meșteri:</span>
        <span>${county.craftsmen}</span>
      </div>
    `;
    
    tooltipRef.current.style.display = "block";
    
    // Poziționăm tooltip-ul lângă cursor
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    tooltipRef.current.style.left = `${mouseX + 15}px`;
    tooltipRef.current.style.top = `${mouseY - 15}px`;
  };

  const handleCountyMouseMove = (event: React.MouseEvent) => {
    if (!tooltipRef.current) return;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    tooltipRef.current.style.left = `${mouseX + 15}px`;
    tooltipRef.current.style.top = `${mouseY - 15}px`;
  };

  const handleCountyMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = "none";
    }
  };

  return (
    <div className="w-full h-full relative">
      <svg
        ref={mapRef}
        viewBox="0 0 800 500"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Aici vom adăuga path-urile pentru conturul fiecărui județ al României */}
        {/* Acesta este un exemplu simplificat, în implementarea reală vom avea path-uri complete pentru fiecare județ */}
        <path
          d="M400 150 L450 200 L400 250 L350 200 Z"
          fill={getCountyFill("București")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "București")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />
        
        {/* Alte județe vor fi adăugate aici */}
      </svg>
    </div>
  );
};

export default RomaniaMap;
