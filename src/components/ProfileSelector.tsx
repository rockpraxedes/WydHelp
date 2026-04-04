// src/components/ProfileSelector.tsx

import { useState, useRef } from 'react'
import { Profile } from '@/hooks/useProfiles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  ChevronDownIcon, PencilIcon, TrashIcon,
  PlusIcon, DownloadIcon, UploadIcon, CheckIcon, HistoryIcon,
} from 'lucide-react'

interface ProfileSelectorProps {
  profiles: Profile[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => string
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onExport: (id: string) => void
  onImport: (file: File) => void
  onImportLegacy: (file: File) => void
}

export function ProfileSelector({
  profiles, activeId, onSelect, onAdd, onRename,
  onDelete, onExport, onImport, onImportLegacy,
}: ProfileSelectorProps) {
  const [open, setOpen]           = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName]   = useState('')
  const [adding, setAdding]       = useState(false)
  const [newName, setNewName]     = useState('')
  const importRef                 = useRef<HTMLInputElement>(null)
  const importLegacyRef           = useRef<HTMLInputElement>(null)

  const activeProfile = profiles.find(p => p.id === activeId)

  const handleSelect = (id: string) => {
    onSelect(id)
    setOpen(false)
    setEditingId(null)
  }

  const handleRename = (id: string) => {
    if (editName.trim()) onRename(id, editName)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (newName.trim()) {
      const id = onAdd(newName)
      setAdding(false)
      setNewName('')
      handleSelect(id)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onImport(file)
    e.target.value = ''
  }

  const handleImportLegacy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onImportLegacy(file)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Perfil</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs hover:bg-muted/50 transition-colors">
            {activeProfile?.name ?? '—'}
            <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">

            {/* Lista de perfis */}
            {profiles.map(profile => (
              <div
                key={profile.id}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 group',
                  activeId === profile.id ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                {editingId === profile.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      autoFocus
                      className="flex-1 text-sm bg-background border rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(profile.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <button onClick={() => handleRename(profile.id)} className="text-violet-600 hover:text-violet-700">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button className="flex-1 text-sm text-left" onClick={() => handleSelect(profile.id)}>
                      {profile.name}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(profile.id); setEditName(profile.name) }}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Renomear"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onExport(profile.id)}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Exportar"
                      >
                        <DownloadIcon className="w-3 h-3" />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          onClick={() => onDelete(profile.id)}
                          className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                          title="Deletar"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Ações */}
            <div className="border-t pt-1 mt-1 space-y-0.5">
              {adding ? (
                <div className="flex items-center gap-1 px-2 py-1">
                  <input
                    autoFocus
                    placeholder="Nome do perfil"
                    className="flex-1 text-sm bg-background border rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAdd()
                      if (e.key === 'Escape') { setAdding(false); setNewName('') }
                    }}
                  />
                  <button onClick={handleAdd} className="text-violet-600 hover:text-violet-700">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Novo perfil
                </button>
              )}

              <button
                onClick={() => importRef.current?.click()}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
              >
                <UploadIcon className="w-3.5 h-3.5" />
                Importar perfil
              </button>

              {/* Importar JSON legado */}
              <button
                onClick={() => importLegacyRef.current?.click()}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                Importar histórico antigo
              </button>

              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <input ref={importLegacyRef} type="file" accept=".json" className="hidden" onChange={handleImportLegacy} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}