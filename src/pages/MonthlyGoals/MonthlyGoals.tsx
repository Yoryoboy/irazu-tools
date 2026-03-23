import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lazy, Suspense } from 'react';
import BauGoals from './BauGoals/BauGoals';

const HsGoals = lazy(() => import('./HsGoals/HsGoals'));

export default function MonthlyGoals() {
  return (
    <main className="space-y-4 text-left">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Monthly Goals Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Track monthly production goals for designers and QC reviewers.
        </p>
      </header>

      <Tabs defaultValue="bau" className="w-full">
        <TabsList>
          <TabsTrigger value="bau">BAU</TabsTrigger>
          <TabsTrigger value="hs">HS</TabsTrigger>
        </TabsList>

        <TabsContent value="bau" className="mt-4">
          <BauGoals />
        </TabsContent>

        <TabsContent value="hs" className="mt-4">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading HS goals...</p>}>
            <HsGoals />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  );
}
