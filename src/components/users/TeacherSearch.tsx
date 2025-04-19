
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
          <label htmlFor="teacherId" className="text-sm font-medium mb-2 block">
            Search by Teacher ID
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="teacherId"
              placeholder="Enter Teacher ID..."
              value={idSearch}
              onChange={(e) => handleSearch("id", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="teacherName" className="text-sm font-medium mb-2 block">
            Search by Teacher Name
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="teacherName"
              placeholder="Enter Teacher Name..."
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
