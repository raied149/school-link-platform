import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StudentDetail } from "@/types";

interface StudentSearchProps {
  onSearch: (filters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  }) => void;
}

export function StudentSearch({ onSearch }: StudentSearchProps) {
  const [idSearch, setIdSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  const handleSearch = (
    type: "id" | "name" | "global",
    value: string
  ) => {
    const newFilters = {
      idSearch: type === "id" ? value : idSearch,
      nameSearch: type === "name" ? value : nameSearch,
      globalSearch: type === "global" ? value : globalSearch,
    };
    
    if (type === "id") setIdSearch(value);
    if (type === "name") setNameSearch(value);
    if (type === "global") setGlobalSearch(value);
    
    onSearch(newFilters);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="studentId" className="text-sm font-medium mb-2 block">
            Search by Student ID
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="studentId"
              placeholder="Enter Student ID..."
              value={idSearch}
              onChange={(e) => handleSearch("id", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="studentName" className="text-sm font-medium mb-2 block">
            Search by Student Name
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="studentName"
              placeholder="Enter Student Name..."
              value={nameSearch}
              onChange={(e) => handleSearch("name", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>
      <div className="relative">
        <label htmlFor="globalSearch" className="text-sm font-medium mb-2 block">
          Global Search (search across all fields)
        </label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="globalSearch"
            placeholder="Search anything..."
            value={globalSearch}
            onChange={(e) => handleSearch("global", e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
}
