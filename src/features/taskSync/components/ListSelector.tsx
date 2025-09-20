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
    <Card className="border-slate-800/80 bg-slate-900/70 shadow-[0_40px_120px_-60px_rgba(16,185,129,0.75)] backdrop-blur">
      <CardHeader className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-emerald-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-xs font-semibold text-emerald-200">
            PASO 1
          </span>
          <span className="font-semibold tracking-[0.28em] text-emerald-200">Selecciona el flujo destino</span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-slate-50">Selecciona la lista destino</CardTitle>
          <CardDescription className="text-sm text-slate-400">
            Elige el flujo de ClickUp al que quieres sincronizar las tareas nuevas detectadas en el Excel de MQMS.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Flujo principal</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {mainOptions.map(option => {
              const isActive = main === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'group h-auto flex-col items-start justify-start gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-6 py-5 text-left shadow-[0_12px_30px_-20px_rgba(15,23,42,0.8)] transition-all',
                    isActive
                      ? 'border-emerald-400/80 bg-emerald-500/10 ring-2 ring-emerald-400/40'
                      : 'hover:border-slate-700 hover:bg-slate-900/60 hover:shadow-[0_25px_45px_-32px_rgba(16,185,129,0.55)]'
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
                  <span className="inline-flex items-center gap-3 text-sm font-semibold text-slate-100">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                        isActive
                          ? 'border-emerald-300 bg-emerald-400/20 text-emerald-100'
                          : 'border-slate-700 bg-slate-900/70 text-slate-400'
                      )}
                    >
                      {option.label.charAt(0)}
                    </span>
                    {option.label}
                  </span>
                  <span className="block text-xs text-slate-400 transition-colors group-hover:text-slate-300">
                    {option.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {main === 'bau' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Tipo de BAU</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {bauOptions.map(option => {
                const isActive = bau === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'group h-auto flex-col items-start justify-start gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4 text-left transition-all',
                      isActive
                        ? 'border-emerald-400/70 bg-emerald-500/10 ring-1 ring-emerald-400/40'
                        : 'hover:border-slate-700 hover:bg-slate-900/60'
                    )}
                    onClick={() => {
                      setBau(option.value);
                      if (option.value === 'cci') onListResolved(CLICKUP_LIST_IDS.cciBau);
                      if (option.value === 'truenet') onListResolved(CLICKUP_LIST_IDS.trueNetBau);
                      if (option.value === 'techserv') onListResolved(CLICKUP_LIST_IDS.techservBau);
                    }}
                  >
                    <span className="text-sm font-semibold text-slate-100">{option.label}</span>
                    <span className="block text-xs text-slate-400 transition-colors group-hover:text-slate-300">
                      {option.description}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t border-slate-800/70 bg-slate-900/60 px-6 py-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={listId ? 'default' : 'secondary'}
            className={cn(listId ? 'bg-emerald-400/90 text-slate-950' : 'bg-slate-800/90 text-slate-200')}
          >
            {listId ? 'Listo para sincronizar' : 'Selecciona una lista'}
          </Badge>
          <span className="text-xs text-slate-500">
            {main === 'bau' ? 'BAU requiere un subtipo.' : 'High Split se resuelve automáticamente.'}
          </span>
        </div>
        {listId && <span className="text-xs text-slate-500">ID seleccionado: {listId}</span>}
      </CardFooter>
    </Card>
  );
}
