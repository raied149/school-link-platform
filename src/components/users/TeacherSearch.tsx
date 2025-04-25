
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TeacherSearchProps {
  onSearch: (filters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  }) => void;
}

export function TeacherSearch({ onSearch }: TeacherSearchProps) {
  const [globalSearch, setGlobalSearch] = useState("");

  const handleSearch = (value: string) => {
    const newFilters = {
      idSearch: "",
      nameSearch: "",
      globalSearch: value,
    };
    
    setGlobalSearch(value);
    onSearch(newFilters);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <label htmlFor="globalSearch" className="text-sm font-medium mb-2 block">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="globalSearch"
            placeholder="Search across all fields..."
            value={globalSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
}
