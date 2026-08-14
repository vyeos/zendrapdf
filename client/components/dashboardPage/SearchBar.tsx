'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSidebar } from '../ui/sidebar'
import { useCommandPalette } from '@/hooks/useCommandPalette'

export default function SearchBar() {
    const { state } = useSidebar()
    const { setOpen } = useCommandPalette()

    return (
        <div className="p-2">
            {state === 'collapsed' ? (
                <button
                    type="button"
                    aria-label="Open search"
                    className="cursor-pointer h-8 w-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    onClick={() => setOpen(true)}
                >
                    <Search className="size-4 text-sidebar-foreground" />
                </button>
            ) : (
                <div className="relative">
                    <Input
                        type="text"
                        placeholder={`Search or press ⌘K`}
                        onClick={() => {
                            setOpen(true)
                        }}
                        readOnly
                        className="w-full h-8 rounded-md border-sidebar-border bg-sidebar text-sidebar-foreground placeholder:text-sidebar-foreground/60 pr-16 focus:ring-2 focus:ring-sidebar-ring transition-all duration-200 cursor-pointer"
                    />
                </div>
            )}
        </div>
    )
}
