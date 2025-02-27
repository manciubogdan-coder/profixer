
import { useEffect, useRef } from "react";

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
        viewBox="0 0 800 600"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Alba */}
        <path
          d="M290 300 L310 280 L330 290 L350 280 L360 290 L350 310 L360 330 L340 340 L320 330 L300 340 L280 330 L290 300Z"
          fill={getCountyFill("Alba")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Alba")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Arad */}
        <path
          d="M170 280 L190 260 L210 270 L230 260 L250 270 L240 290 L250 310 L230 320 L210 310 L190 320 L170 310 L170 280Z"
          fill={getCountyFill("Arad")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Arad")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Argeș */}
        <path
          d="M350 400 L370 380 L390 390 L410 380 L420 390 L410 410 L420 430 L400 440 L380 430 L360 440 L340 430 L350 400Z"
          fill={getCountyFill("Argeș")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Argeș")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Bacău */}
        <path
          d="M450 250 L470 230 L490 240 L510 230 L520 240 L510 260 L520 280 L500 290 L480 280 L460 290 L440 280 L450 250Z"
          fill={getCountyFill("Bacău")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Bacău")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Bihor */}
        <path
          d="M200 200 L220 180 L240 190 L260 180 L270 190 L260 210 L270 230 L250 240 L230 230 L210 240 L190 230 L200 200Z"
          fill={getCountyFill("Bihor")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Bihor")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Bistrița-Năsăud */}
        <path
          d="M320 180 L340 160 L360 170 L380 160 L390 170 L380 190 L390 210 L370 220 L350 210 L330 220 L310 210 L320 180Z"
          fill={getCountyFill("Bistrița-Năsăud")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Bistrița-Năsăud")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Botoșani */}
        <path
          d="M440 140 L460 120 L480 130 L500 120 L510 130 L500 150 L510 170 L490 180 L470 170 L450 180 L430 170 L440 140Z"
          fill={getCountyFill("Botoșani")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Botoșani")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Brăila */}
        <path
          d="M520 350 L540 330 L560 340 L580 330 L590 340 L580 360 L590 380 L570 390 L550 380 L530 390 L510 380 L520 350Z"
          fill={getCountyFill("Brăila")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Brăila")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Brașov */}
        <path
          d="M380 300 L400 280 L420 290 L440 280 L450 290 L440 310 L450 330 L430 340 L410 330 L390 340 L370 330 L380 300Z"
          fill={getCountyFill("Brașov")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Brașov")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* București */}
        <path
          d="M430 430 L440 420 L450 425 L460 420 L465 425 L460 435 L465 445 L455 450 L445 445 L435 450 L425 445 L430 430Z"
          fill={getCountyFill("București")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "București")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Buzău */}
        <path
          d="M470 350 L490 330 L510 340 L530 330 L540 340 L530 360 L540 380 L520 390 L500 380 L480 390 L460 380 L470 350Z"
          fill={getCountyFill("Buzău")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Buzău")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Călărași */}
        <path
          d="M460 450 L480 430 L500 440 L520 430 L530 440 L520 460 L530 480 L510 490 L490 480 L470 490 L450 480 L460 450Z"
          fill={getCountyFill("Călărași")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Călărași")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Caraș-Severin */}
        <path
          d="M220 340 L240 320 L260 330 L280 320 L290 330 L280 350 L290 370 L270 380 L250 370 L230 380 L210 370 L220 340Z"
          fill={getCountyFill("Caraș-Severin")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Caraș-Severin")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Cluj */}
        <path
          d="M270 230 L290 210 L310 220 L330 210 L340 220 L330 240 L340 260 L320 270 L300 260 L280 270 L260 260 L270 230Z"
          fill={getCountyFill("Cluj")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Cluj")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Constanța */}
        <path
          d="M560 400 L580 380 L600 390 L620 380 L630 390 L620 410 L630 430 L610 440 L590 430 L570 440 L550 430 L560 400Z"
          fill={getCountyFill("Constanța")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Constanța")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Covasna */}
        <path
          d="M420 280 L440 260 L460 270 L480 260 L490 270 L480 290 L490 310 L470 320 L450 310 L430 320 L410 310 L420 280Z"
          fill={getCountyFill("Covasna")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Covasna")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Dâmbovița */}
        <path
          d="M380 380 L400 360 L420 370 L440 360 L450 370 L440 390 L450 410 L430 420 L410 410 L390 420 L370 410 L380 380Z"
          fill={getCountyFill("Dâmbovița")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Dâmbovița")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Dolj */}
        <path
          d="M290 430 L310 410 L330 420 L350 410 L360 420 L350 440 L360 460 L340 470 L320 460 L300 470 L280 460 L290 430Z"
          fill={getCountyFill("Dolj")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Dolj")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Galați */}
        <path
          d="M510 320 L530 300 L550 310 L570 300 L580 310 L570 330 L580 350 L560 360 L540 350 L520 360 L500 350 L510 320Z"
          fill={getCountyFill("Galați")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Galați")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Giurgiu */}
        <path
          d="M410 450 L430 430 L450 440 L470 430 L480 440 L470 460 L480 480 L460 490 L440 480 L420 490 L400 480 L410 450Z"
          fill={getCountyFill("Giurgiu")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Giurgiu")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Gorj */}
        <path
          d="M290 380 L310 360 L330 370 L350 360 L360 370 L350 390 L360 410 L340 420 L320 410 L300 420 L280 410 L290 380Z"
          fill={getCountyFill("Gorj")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Gorj")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Harghita */}
        <path
          d="M370 240 L390 220 L410 230 L430 220 L440 230 L430 250 L440 270 L420 280 L400 270 L380 280 L360 270 L370 240Z"
          fill={getCountyFill("Harghita")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Harghita")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Hunedoara */}
        <path
          d="M270 320 L290 300 L310 310 L330 300 L340 310 L330 330 L340 350 L320 360 L300 350 L280 360 L260 350 L270 320Z"
          fill={getCountyFill("Hunedoara")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Hunedoara")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Ialomița */}
        <path
          d="M490 420 L510 400 L530 410 L550 400 L560 410 L550 430 L560 450 L540 460 L520 450 L500 460 L480 450 L490 420Z"
          fill={getCountyFill("Ialomița")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Ialomița")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Iași */}
        <path
          d="M490 190 L510 170 L530 180 L550 170 L560 180 L550 200 L560 220 L540 230 L520 220 L500 230 L480 220 L490 190Z"
          fill={getCountyFill("Iași")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Iași")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Ilfov */}
        <path
          d="M440 420 L450 410 L460 415 L470 410 L475 415 L470 425 L475 435 L465 440 L455 435 L445 440 L435 435 L440 420Z"
          fill={getCountyFill("Ilfov")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Ilfov")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Maramureș */}
        <path
          d="M270 150 L290 130 L310 140 L330 130 L340 140 L330 160 L340 180 L320 190 L300 180 L280 190 L260 180 L270 150Z"
          fill={getCountyFill("Maramureș")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Maramureș")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Mehedinți */}
        <path
          d="M250 410 L270 390 L290 400 L310 390 L320 400 L310 420 L320 440 L300 450 L280 440 L260 450 L240 440 L250 410Z"
          fill={getCountyFill("Mehedinți")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Mehedinți")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Mureș */}
        <path
          d="M320 260 L340 240 L360 250 L380 240 L390 250 L380 270 L390 290 L370 300 L350 290 L330 300 L310 290 L320 260Z"
          fill={getCountyFill("Mureș")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Mureș")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Neamț */}
        <path
          d="M430 200 L450 180 L470 190 L490 180 L500 190 L490 210 L500 230 L480 240 L460 230 L440 240 L420 230 L430 200Z"
          fill={getCountyFill("Neamț")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Neamț")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Olt */}
        <path
          d="M350 430 L370 410 L390 420 L410 410 L420 420 L410 440 L420 460 L400 470 L380 460 L360 470 L340 460 L350 430Z"
          fill={getCountyFill("Olt")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Olt")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Prahova */}
        <path
          d="M420 350 L440 330 L460 340 L480 330 L490 340 L480 360 L490 380 L470 390 L450 380 L430 390 L410 380 L420 350Z"
          fill={getCountyFill("Prahova")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Prahova")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Sălaj */}
        <path
          d="M240 200 L260 180 L280 190 L300 180 L310 190 L300 210 L310 230 L290 240 L270 230 L250 240 L230 230 L240 200Z"
          fill={getCountyFill("Sălaj")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Sălaj")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Satu Mare */}
        <path
          d="M220 160 L240 140 L260 150 L280 140 L290 150 L280 170 L290 190 L270 200 L250 190 L230 200 L210 190 L220 160Z"
          fill={getCountyFill("Satu Mare")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Satu Mare")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Sibiu */}
        <path
          d="M330 320 L350 300 L370 310 L390 300 L400 310 L390 330 L400 350 L380 360 L360 350 L340 360 L320 350 L330 320Z"
          fill={getCountyFill("Sibiu")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Sibiu")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Suceava */}
        <path
          d="M380 150 L400 130 L420 140 L440 130 L450 140 L440 160 L450 180 L430 190 L410 180 L390 190 L370 180 L380 150Z"
          fill={getCountyFill("Suceava")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Suceava")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Teleorman */}
        <path
          d="M380 450 L400 430 L420 440 L440 430 L450 440 L440 460 L450 480 L430 490 L410 480 L390 490 L370 480 L380 450Z"
          fill={getCountyFill("Teleorman")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Teleorman")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Timiș */}
        <path
          d="M200 310 L220 290 L240 300 L260 290 L270 300 L260 320 L270 340 L250 350 L230 340 L210 350 L190 340 L200 310Z"
          fill={getCountyFill("Timiș")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Timiș")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Tulcea */}
        <path
          d="M560 340 L580 320 L600 330 L620 320 L630 330 L620 350 L630 370 L610 380 L590 370 L570 380 L550 370 L560 340Z"
          fill={getCountyFill("Tulcea")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Tulcea")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Vaslui */}
        <path
          d="M520 230 L540 210 L560 220 L580 210 L590 220 L580 240 L590 260 L570 270 L550 260 L530 270 L510 260 L520 230Z"
          fill={getCountyFill("Vaslui")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Vaslui")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Vâlcea */}
        <path
          d="M330 370 L350 350 L370 360 L390 350 L400 360 L390 380 L400 400 L380 410 L360 400 L340 410 L320 400 L330 370Z"
          fill={getCountyFill("Vâlcea")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Vâlcea")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />

        {/* Vrancea */}
        <path
          d="M470 290 L490 270 L510 280 L530 270 L540 280 L530 300 L540 320 L520 330 L500 320 L480 330 L460 320 L470 290Z"
          fill={getCountyFill("Vrancea")}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          onMouseEnter={(e) => handleCountyMouseEnter(e, "Vrancea")}
          onMouseMove={handleCountyMouseMove}
          onMouseLeave={handleCountyMouseLeave}
        />
      </svg>
    </div>
  );
};

export default RomaniaMap;
