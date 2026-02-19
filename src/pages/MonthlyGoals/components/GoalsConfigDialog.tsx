import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MonthGoalsConfig } from '../MonthlyGoals.types';
import { ExportImportConfig } from './ExportImportConfig';

interface GoalsConfigDialogMember {
  memberId: number;
  memberName: string;
}

interface GoalsConfigDialogProps {
  monthKey: string;
  monthConfig: MonthGoalsConfig;
  members: GoalsConfigDialogMember[];
  onSave: (monthConfig: MonthGoalsConfig) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

interface OverrideInputState {
  designerGoal: string;
  qcGoal: string;
}

function toInputValue(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

function toPositiveNumberOrFallback(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function toOptionalPositiveNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function GoalsConfigDialog({
  monthKey,
  monthConfig,
  members,
  onSave,
  onExport,
  onImport,
}: GoalsConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [defaultDesignerGoal, setDefaultDesignerGoal] = useState('');
  const [defaultQcGoal, setDefaultQcGoal] = useState('');
  const [overrideValues, setOverrideValues] = useState<Record<number, OverrideInputState>>({});

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.memberName.localeCompare(b.memberName)),
    [members]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setDefaultDesignerGoal(String(monthConfig.defaultDesignerGoal));
    setDefaultQcGoal(String(monthConfig.defaultQcGoal));

    const overridesFromConfig: Record<number, OverrideInputState> = {};

    sortedMembers.forEach(member => {
      const override = monthConfig.memberOverrides[member.memberId];

      overridesFromConfig[member.memberId] = {
        designerGoal: toInputValue(override?.designerGoal),
        qcGoal: toInputValue(override?.qcGoal),
      };
    });

    Object.entries(monthConfig.memberOverrides).forEach(([memberId, override]) => {
      const numericId = Number(memberId);

      if (!overridesFromConfig[numericId]) {
        overridesFromConfig[numericId] = {
          designerGoal: toInputValue(override.designerGoal),
          qcGoal: toInputValue(override.qcGoal),
        };
      }
    });

    setOverrideValues(overridesFromConfig);
  }, [monthConfig, open, sortedMembers]);

  const handleSave = () => {
    const nextDefaultDesignerGoal = toPositiveNumberOrFallback(
      defaultDesignerGoal,
      monthConfig.defaultDesignerGoal
    );
    const nextDefaultQcGoal = toPositiveNumberOrFallback(defaultQcGoal, monthConfig.defaultQcGoal);

    const nextOverrides: MonthGoalsConfig['memberOverrides'] = {};

    Object.entries(overrideValues).forEach(([memberId, override]) => {
      const designerGoal = toOptionalPositiveNumber(override.designerGoal);
      const qcGoal = toOptionalPositiveNumber(override.qcGoal);

      if (designerGoal === undefined && qcGoal === undefined) {
        return;
      }

      nextOverrides[Number(memberId)] = {
        ...(designerGoal !== undefined ? { designerGoal } : {}),
        ...(qcGoal !== undefined ? { qcGoal } : {}),
      };
    });

    onSave({
      defaultDesignerGoal: nextDefaultDesignerGoal,
      defaultQcGoal: nextDefaultQcGoal,
      memberOverrides: nextOverrides,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Settings2 className="mr-1 size-4" />
          Goals Config
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Monthly Goals Configuration</DialogTitle>
          <DialogDescription>
            Configure goals for <strong>{monthKey}</strong>. Empty member overrides use defaults.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultDesignerGoal">Default Designer Goal</Label>
              <Input
                id="defaultDesignerGoal"
                type="number"
                min="0"
                step="0.01"
                value={defaultDesignerGoal}
                onChange={event => setDefaultDesignerGoal(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultQcGoal">Default QC Goal</Label>
              <Input
                id="defaultQcGoal"
                type="number"
                min="0"
                step="0.01"
                value={defaultQcGoal}
                onChange={event => setDefaultQcGoal(event.target.value)}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <div className="text-sm font-medium">Member Overrides</div>

            <div className="max-h-72 overflow-auto rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-muted/50">
                  <tr>
                    <th className="px-3 py-2">Member</th>
                    <th className="px-3 py-2">Designer Goal</th>
                    <th className="px-3 py-2">QC Goal</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        No members available yet. Load month data first.
                      </td>
                    </tr>
                  ) : (
                    sortedMembers.map(member => {
                      const values = overrideValues[member.memberId] ?? {
                        designerGoal: '',
                        qcGoal: '',
                      };

                      return (
                        <tr key={member.memberId} className="border-t">
                          <td className="px-3 py-2 font-medium">{member.memberName}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Default"
                              value={values.designerGoal}
                              onChange={event => {
                                const value = event.target.value;

                                setOverrideValues(previous => ({
                                  ...previous,
                                  [member.memberId]: {
                                    ...(previous[member.memberId] ?? {
                                      designerGoal: '',
                                      qcGoal: '',
                                    }),
                                    designerGoal: value,
                                  },
                                }));
                              }}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Default"
                              value={values.qcGoal}
                              onChange={event => {
                                const value = event.target.value;

                                setOverrideValues(previous => ({
                                  ...previous,
                                  [member.memberId]: {
                                    ...(previous[member.memberId] ?? {
                                      designerGoal: '',
                                      qcGoal: '',
                                    }),
                                    qcGoal: value,
                                  },
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          <ExportImportConfig onExport={onExport} onImport={onImport} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Goals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
