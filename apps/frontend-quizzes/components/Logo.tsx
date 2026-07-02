import { GiTrophyCup } from "react-icons/gi";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group z-50">
      <div className="flex items-center gap-1">
        <span className="text-3xl font-bold text-sky-500 transition-transform duration-300 group-hover:scale-110">
          <GiTrophyCup className="w-6 h-6" />
        </span>
        <span className="font-brand font-extrabold text-xl tracking-tight group-hover:opacity-95 transition-opacity">
          <span className="text-foreground">Frontend</span>
          <span className="text-sky-500">Prep</span>
        </span>
      </div>
    </Link>
  );
};

export default Logo;
