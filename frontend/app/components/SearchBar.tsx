import { useState } from "react";
import { Job } from "../types/job";

interface SearchBarProps {
  data: Job[];
  placeholder?: string;
  onResults?: (results: Job[]) => void;
}

export default function SearchBar({
  data,
  placeholder,
  onResults,
}: SearchBarProps) {
  const [query, setQuery] = useState<string>("");

  const handleChange = (value: string) => {
    setQuery(value);
    const filtered = data.filter((item) =>
      item.company.toLowerCase().includes(value.toLowerCase())
    );
    if (onResults) onResults(filtered);
  };

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder || "Rechercher..."}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="border p-2 rounded w-full"
      />
    </div>
  );
}
