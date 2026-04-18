import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"

export function Search() {
  return (
    <div className="relative w-64">
      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="搜索..."
        className="pl-8"
      />
    </div>
  )
} 