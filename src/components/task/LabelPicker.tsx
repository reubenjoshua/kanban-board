import type { Label } from '../../store/types.ts'
import { cn } from '../../utils/cn.ts'

type LabelPickerProps = {
  labels: Record<string, Label>
  selectedIds: string[]
  onChange: (labelIds: string[]) => void
}

export function LabelPicker({ labels, selectedIds, onChange }: LabelPickerProps) {
  const labelList = Object.values(labels)

  if (labelList.length === 0) {
    return <p className="text-sm text-slate-500">No labels on this board.</p>
  }

  const toggle = (labelId: string) => {
    if (selectedIds.includes(labelId)) {
      onChange(selectedIds.filter((id) => id !== labelId))
    } else {
      onChange([...selectedIds, labelId])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labelList.map((label) => {
        const isSelected = selectedIds.includes(label.id)
        return (
          <button
            key={label.id}
            type="button"
            onClick={() => toggle(label.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              label.color,
              isSelected
                ? 'ring-2 ring-brand-500 ring-offset-2'
                : 'opacity-50 hover:opacity-100',
            )}
          >
            {label.name}
          </button>
        )
      })}
    </div>
  )
}
