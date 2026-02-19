import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BauGoals from './BauGoals/BauGoals';

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
          <TabsTrigger value="hs" disabled>
            HS
          </TabsTrigger>
          <Badge variant="outline" className="ml-2">
            HS coming soon
          </Badge>
        </TabsList>

        <TabsContent value="bau" className="mt-4">
          <BauGoals />
        </TabsContent>

        <TabsContent value="hs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>HS Goals</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              HS goals will be enabled in a future iteration.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
