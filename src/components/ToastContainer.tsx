// src/components/ToastContainer.tsx

import { Toast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { CheckIcon, XIcon, InfoIcon } from 'lucide-react'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg pointer-events-auto',
            'animate-in slide-in-from-bottom-2 fade-in duration-200',
            toast.type === 'success' && 'bg-violet-600 text-white',
            toast.type === 'error'   && 'bg-red-600 text-white',
            toast.type === 'info'    && 'bg-zinc-800 text-white',
          )}
        >
          {toast.type === 'success' && <CheckIcon className="w-4 h-4 shrink-0" />}
          {toast.type === 'error'   && <XIcon className="w-4 h-4 shrink-0" />}
          {toast.type === 'info'    && <InfoIcon className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
