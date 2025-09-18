import { useMemo } from 'react';
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
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/40">
        <h2 className="text-lg font-semibold mb-3">Selecciona la lista destino</h2>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="main"
              value="highsplit"
              checked={main === 'highsplit'}
              onChange={() => {
                setMain('highsplit');
                setBau(null);
                onListResolved(CLICKUP_LIST_IDS.cciHs);
              }}
            />
            <span>High Split</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="main"
              value="bau"
              checked={main === 'bau'}
              onChange={() => {
                setMain('bau');
                onListResolved(null);
              }}
            />
            <span>BAU</span>
          </label>
        </div>

        {main === 'bau' && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-zinc-300">Seleccione el tipo de BAU:</p>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="bau"
                  value="cci"
                  checked={bau === 'cci'}
                  onChange={() => {
                    setBau('cci');
                    onListResolved(CLICKUP_LIST_IDS.cciBau);
                  }}
                />
                <span>CCI</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="bau"
                  value="truenet"
                  checked={bau === 'truenet'}
                  onChange={() => {
                    setBau('truenet');
                    onListResolved(CLICKUP_LIST_IDS.trueNetBau);
                  }}
                />
                <span>TrueNet</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="bau"
                  value="techserv"
                  checked={bau === 'techserv'}
                  onChange={() => {
                    setBau('techserv');
                    onListResolved(CLICKUP_LIST_IDS.techservBau);
                  }}
                />
                <span>TechServ</span>
              </label>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-zinc-400">
          {listId ? 'Listo para sincronizar.' : 'Seleccione una lista y (si aplica) un tipo de BAU.'}
        </div>
      </div>
    </div>
  );
}
