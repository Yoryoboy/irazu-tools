import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sileo } from 'sileo';
import { useMemo, useState } from 'react';
import { dayjs } from '../../../utils/dayjs';
import { ARGENTINA_TZ } from '../MonthlyGoals.constants';
import { useGoalsConfig } from '../hooks/useGoalsConfig';
import { GoalsConfigDialog } from '../components/GoalsConfigDialog';
import { MemberPerformanceTable } from '../components/MemberPerformanceTable';
import { MonthSelector } from '../components/MonthSelector';
import { WarningsPanel } from '../components/WarningsPanel';
import { useBauGoals } from './BauGoals.hooks';

function getCurrentMonthInArgentina() {
  const now = dayjs().tz(ARGENTINA_TZ);

  return {
    month: now.month() + 1,
    year: now.year(),
  };
}

export default function BauGoals() {
  const currentMonth = getCurrentMonthInArgentina();

  const [month, setMonth] = useState(currentMonth.month);
  const [year, setYear] = useState(currentMonth.year);

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  const { getMonthConfig, setMonthConfig, exportConfig, importConfig } = useGoalsConfig();
  const monthConfig = getMonthConfig(monthKey);

  const { summary, loading, error } = useBauGoals(year, month, monthConfig);

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
  }, [monthConfig.memberOverrides, summary.designerPerformance, summary.qcPerformance]);

  const handleSaveConfig = (nextMonthConfig: typeof monthConfig) => {
    setMonthConfig(monthKey, nextMonthConfig);
    sileo.success({
      title: `Saved goals for ${monthKey}.`,
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
          monthKey={monthKey}
          monthConfig={monthConfig}
          members={membersForConfig}
          onSave={handleSaveConfig}
          onExport={exportConfig}
          onImport={handleImportConfig}
        />
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load BAU goals data</AlertTitle>
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
            <p className="mt-3 text-xs text-muted-foreground">Tasks completed in selected month.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Design Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold leading-none">{summary.totalDesignPoints}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Team aggregate output (unsplit points) for the selected month.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Design points are split proportionally across all assignees and QC reviewers on each task.
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tasks from ClickUp...</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <MemberPerformanceTable
            title="Designer Performance"
            members={summary.designerPerformance}
            splitLabel="Points are split proportionally among all assignees on each task."
          />

          <MemberPerformanceTable
            title="QC Performance"
            members={summary.qcPerformance}
            splitLabel="Points are split proportionally among all QC reviewers on each task."
          />
        </div>
      )}

      <WarningsPanel tasksWithWarnings={summary.tasksWithWarnings} monthKey={monthKey} type="BAU" />
    </section>
  );
}
