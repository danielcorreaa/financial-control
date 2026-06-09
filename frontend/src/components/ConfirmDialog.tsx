import Modal from './Modal'

interface Props {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true }: Props) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
          Confirmar
        </button>
      </div>
    </Modal>
  )
}
