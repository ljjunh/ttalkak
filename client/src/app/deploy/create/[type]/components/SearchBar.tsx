import { IoIosSearch } from "react-icons/io";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
}: SearchBarProps) {
  return (
    <div className="mb-4 relative">
      <input
        data-cy="repo-search"
        type="text"
        placeholder="저장소를 검색해주세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 px-10 border rounded-lg"
      />
      <IoIosSearch className="absolute left-4 top-3 text-gray-400 text-xl" />
    </div>
  );
}
