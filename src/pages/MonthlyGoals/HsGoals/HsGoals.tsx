import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sileo } from 'sileo';
import { useMemo, useState } from 'react';
import { dayjs } from '../../../utils/dayjs';
import { CombinedProductionTable } from '../components/CombinedProductionTable';
import { GoalsConfigDialog } from '../components/GoalsConfigDialog';
import { MemberPerformanceTable } from '../components/MemberPerformanceTable';
import { MonthSelector } from '../components/MonthSelector';
import { WarningsPanel } from '../components/WarningsPanel';
import { ARGENTINA_TZ } from '../MonthlyGoals.constants';
import { useGoalsConfig } from '../hooks/useGoalsConfig';
import { useHsGoals } from './HsGoals.hooks';

function getCurrentMonthInArgentina() {
  const now = dayjs().tz(ARGENTINA_TZ);

  return {
    month: now.month() + 1,
    year: now.year(),
  };
}

function formatMiles(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export default function HsGoals() {
  const currentMonth = getCurrentMonthInArgentina();

  const [month, setMonth] = useState(currentMonth.month);
  const [year, setYear] = useState(currentMonth.year);

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const storageMonthKey = `hs-${monthKey}`;

  const { getMonthConfig, setMonthConfig, exportConfig, importConfig } = useGoalsConfig();
  const monthConfig = getMonthConfig(storageMonthKey);

  const { summary, loading, error } = useHsGoals(year, month, monthConfig);

  const membersForConfig = useMemo(() => {
    const memberById = new Map<number, { memberId: number; memberName: string }>();

    summary.designerPerformance.forEach(member => {
      memberById.set(member.memberId, {
        memberId: member.memberId,
        memberName: member.memberName,
      });
    });

    summary.qcPerformance.forEach(member => {
      memberById.set(member.memberId, {
        memberId: member.memberId,
        memberName: member.memberName,
      });
    });

    summary.combinedProduction.forEach(member => {
      memberById.set(member.memberId, {
        memberId: member.memberId,
        memberName: member.memberName,
      });
    });

    Object.keys(monthConfig.memberOverrides).forEach(memberId => {
      const numericId = Number(memberId);

      if (!memberById.has(numericId)) {
        memberById.set(numericId, {
          memberId: numericId,
          memberName: `User ${numericId}`,
        });
      }
    });

    return Array.from(memberById.values());
  }, [
    monthConfig.memberOverrides,
    summary.combinedProduction,
    summary.designerPerformance,
    summary.qcPerformance,
  ]);

  const handleSaveConfig = (nextMonthConfig: typeof monthConfig) => {
    setMonthConfig(storageMonthKey, nextMonthConfig);
    sileo.success({
      title: `Saved HS goals for ${monthKey}.`,
    });
  };

  const handleImportConfig = async (file: File) => {
    try {
      const importedMonths = await importConfig(file);
      sileo.success({
        title: `Imported goals config for ${importedMonths} month(s).`,
      });
    } catch (importError) {
      const message = importError instanceof Error ? importError.message : 'Failed to import config.';
      sileo.error({
        title: message,
      });
    }
  };

  return (
    <section className="space-y-6 text-left">
      <header className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <MonthSelector month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

        <GoalsConfigDialog
          monthKey={`HS ${monthKey}`}
          monthConfig={monthConfig}
          members={membersForConfig}
          onSave={handleSaveConfig}
          onExport={exportConfig}
          onImport={handleImportConfig}
        />
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load HS goals data</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold leading-none">{summary.totalTasks}</p>
            <p className="mt-3 text-xs text-muted-foreground">Valid tasks completed in selected month.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Miles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold leading-none">{formatMiles(summary.totalMiles)}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Team aggregate output (unsplit miles) for the selected month.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Miles are split proportionally across all assignees and QC reviewers for each work type.
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tasks from ClickUp...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <MemberPerformanceTable
              title="Designer Performance"
              members={summary.designerPerformance}
              splitLabel="Miles are split proportionally among all assignees for each work type."
            />

            <MemberPerformanceTable
              title="QC Performance"
              members={summary.qcPerformance}
              splitLabel="Miles are split proportionally among all QC reviewers for each work type."
            />
          </div>

          <CombinedProductionTable members={summary.combinedProduction} />
        </div>
      )}

      <WarningsPanel tasksWithWarnings={summary.tasksWithWarnings} monthKey={monthKey} type="HS" />
    </section>
  );
}
