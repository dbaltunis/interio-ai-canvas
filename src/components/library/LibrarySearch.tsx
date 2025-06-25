
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface LibrarySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const LibrarySearch = ({ value, onChange }: LibrarySearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search fabrics, codes, or brands..."
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
