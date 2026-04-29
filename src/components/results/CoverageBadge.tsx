import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { DrugRecord } from '@/types/drug'

const COVERAGE_CONFIG = {
  thiqa: { label: 'Thiqa', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  basic: { label: 'Basic', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800' },
  abm1: { label: 'ABM 1', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  abm7: { label: 'ABM 7', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
}

interface Props {
  drug: DrugRecord
}

function formatAED(val: number | null) {
  if (val === null) return null
  return `AED ${val.toFixed(2)}`
}

export function CoverageBadges({ drug }: Props) {
  const badges = [
    drug.thiqaFormulary ? { type: 'thiqa' as const, copay: drug.thiqaCopay, reimburse: drug.thiqaMaxReimbursement } : null,
    drug.basicFormulary ? { type: 'basic' as const, copay: drug.basicCopay, reimburse: null } : null,
    drug.abm1Formulary ? { type: 'abm1' as const, copay: null, reimburse: null } : null,
    drug.abm7Formulary ? { type: 'abm7' as const, copay: null, reimburse: null } : null,
  ].filter(Boolean)

  if (badges.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map(b => {
        if (!b) return null
        const cfg = COVERAGE_CONFIG[b.type]
        const copayStr = formatAED(b.copay)
        const reimburseStr = formatAED(b.reimburse)
        const hasTooltip = copayStr || reimburseStr

        const badge = (
          <Badge
            key={b.type}
            variant="outline"
            className={`text-xs px-1.5 py-0 font-medium ${cfg.className}`}
          >
            {cfg.label}
          </Badge>
        )

        if (!hasTooltip) return badge

        return (
          <Tooltip key={b.type}>
            <TooltipTrigger>{badge}</TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-0.5">
                {copayStr && <div>Co-pay: {copayStr}</div>}
                {reimburseStr && <div>Max reimburse: {reimburseStr}</div>}
              </div>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
