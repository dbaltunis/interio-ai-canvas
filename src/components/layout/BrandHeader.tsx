
import { Link } from "react-router-dom";
import { Building } from "lucide-react";

export const BrandHeader = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="bg-brand-primary rounded-lg p-2">
        <Building className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-brand-primary">InterioApp</span>
        <span className="text-xs text-gray-500 leading-none">Window Coverings</span>
      </div>
    </Link>
  );
};
