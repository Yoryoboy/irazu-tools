import { useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';
import { CLICKUP_LIST_IDS } from '../../../utils/config';

export type MainList = 'highsplit' | 'bau' | null;
export type BauType = 'cci' | 'truenet' | 'techserv' | null;

interface Props {
  main: MainList;
  setMain: (v: MainList) => void;
  bau: BauType;
  setBau: (v: BauType) => void;
  onListResolved: (listId: string | null) => void;
}

type OptionBase<TValue> = {
  value: TValue;
  label: string;
  description: string;
};

const mainOptions: OptionBase<Exclude<MainList, null>>[] = [
  {
    value: 'highsplit',
    label: 'High Split',
    description: 'Proyectos CCI High Split: nuevos nodos y expansiones.',
  },
  {
    value: 'bau',
    label: 'BAU',
    description: 'Operación diaria: tickets TrueNet, TechServ o CCI.',
  },
];

const bauOptions: OptionBase<Exclude<BauType, null>>[] = [
  {
    value: 'cci',
    label: 'CCI',
    description: 'Construcción y mantenimiento para CCI.',
  },
  {
    value: 'truenet',
    label: 'TrueNet',
    description: 'Seguimiento y QA de proyectos TrueNet.',
  },
  {
    value: 'techserv',
    label: 'TechServ',
    description: 'Operación BAU para TechServ.',
  },
];

export default function ListSelector({ main, setMain, bau, setBau, onListResolved }: Props) {
  const listId = useMemo(() => {
    if (main === 'highsplit') return CLICKUP_LIST_IDS.cciHs;
    if (main === 'bau') {
      if (bau === 'cci') return CLICKUP_LIST_IDS.cciBau;
      if (bau === 'truenet') return CLICKUP_LIST_IDS.trueNetBau;
      if (bau === 'techserv') return CLICKUP_LIST_IDS.techservBau;
    }
    return null;
  }, [main, bau]);

  return (
    <Card className="border-zinc-800/70">
      <CardHeader>
        <CardTitle>Selecciona la lista destino</CardTitle>
        <CardDescription>
          Elige el flujo de ClickUp al que quieres sincronizar las tareas nuevas detectadas en el Excel de MQMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Flujo principal</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {mainOptions.map(option => {
              const isActive = main === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'h-auto justify-start rounded-2xl border border-transparent px-5 py-4 text-left shadow-inner transition-all',
                    'bg-gradient-to-br from-zinc-900/70 via-zinc-900/40 to-zinc-900/20',
                    isActive
                      ? 'ring-2 ring-emerald-400/60 shadow-[0_12px_45px_-28px_rgba(16,185,129,0.8)]'
                      : 'hover:border-zinc-700 hover:shadow-[0_15px_35px_-30px_rgba(0,0,0,0.8)]'
                  )}
                  onClick={() => {
                    setMain(option.value);
                    if (option.value === 'highsplit') {
                      setBau(null);
                      onListResolved(CLICKUP_LIST_IDS.cciHs);
                    } else {
                      setBau(null);
                      onListResolved(null);
                    }
                  }}
                >
                  <span className="text-sm font-semibold text-zinc-100">{option.label}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{option.description}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {main === 'bau' && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Tipo de BAU</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {bauOptions.map(option => {
                const isActive = bau === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'h-auto justify-start rounded-2xl border border-transparent px-4 py-4 text-left shadow-inner transition-all',
                      'bg-zinc-950/40',
                      isActive
                        ? 'ring-2 ring-emerald-400/50'
                        : 'hover:border-zinc-700 hover:bg-zinc-900/50'
                    )}
                    onClick={() => {
                      setBau(option.value);
                      if (option.value === 'cci') onListResolved(CLICKUP_LIST_IDS.cciBau);
                      if (option.value === 'truenet') onListResolved(CLICKUP_LIST_IDS.trueNetBau);
                      if (option.value === 'techserv') onListResolved(CLICKUP_LIST_IDS.techservBau);
                    }}
                  >
                    <span className="text-sm font-semibold text-zinc-100">{option.label}</span>
                    <span className="mt-1 block text-xs text-zinc-400">{option.description}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={listId ? 'default' : 'secondary'}>{listId ? 'Listo para sincronizar' : 'Selecciona una lista'}</Badge>
          <span className="text-xs text-zinc-500">{main === 'bau' ? 'BAU requiere un subtipo.' : 'High Split se resuelve automáticamente.'}</span>
        </div>
        {listId && <span className="text-xs text-zinc-500">ID seleccionado: {listId}</span>}
      </CardFooter>
    </Card>
  );
}
