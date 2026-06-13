import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

export default function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  return (
    <Dialog open onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className={`${sizeClass[size]} max-h-[90vh] flex flex-col p-0 gap-0`}>
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-base font-bold text-gray-900">{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
