import BauReport from './BauReport';
import HsReport from './HsReport';
import TrueNetReport from './TrueNetReport';

function IncomeReports() {
  return (
    <main className="flex flex-col gap-8">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Logica del Reporte
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Como Se Construyen Los Income Reports
            </h1>
            <p className="max-w-4xl text-sm leading-6 text-slate-600">
              Estos reportes se construyen a partir de tareas de ClickUp filtradas por fechas de
              completion y luego convertidas en filas de produccion facturable. El Excel exportado
              muestra una fila por cada codigo facturable, no una fila por cada tarea.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-xl border border-white bg-white p-4">
              <h2 className="text-base font-semibold text-slate-900">BAU</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Filtra por <strong>ACTUAL COMPLETION DATE</strong> y conserva tareas en estado{' '}
                <strong>approved</strong> o <strong>sent</strong>. Cada codigo numerico con precio
                configurado en BAU se convierte en una fila dentro del Excel.
              </p>
            </article>

            <article className="rounded-xl border border-white bg-white p-4">
              <h2 className="text-base font-semibold text-slate-900">HS</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Usa tres busquedas independientes por fase con <strong>include closed</strong>{' '}
                activado: <strong>PREASBUILT ACTUAL COMPLETION DATE </strong> para Asbuilt,
                <strong> ACTUAL COMPLETION DATE </strong> para Design y
                <strong> REDESIGN ACTUAL COMPLETION DATE </strong> para Redesign. Una misma tarea
                puede aparecer varias veces si mas de una fase cae dentro del rango seleccionado.
              </p>
            </article>

            <article className="rounded-xl border border-white bg-white p-4">
              <h2 className="text-base font-semibold text-slate-900">TrueNet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Filtra por <strong>ACTUAL COMPLETION DATE</strong> y conserva tareas en estado{' '}
                <strong>approved</strong> o <strong>sent</strong>. El reporte exporta cada codigo
                de TrueNet que tenga precio configurado dentro de la tarea.
              </p>
            </article>
          </div>

          <div className="grid gap-4 rounded-xl border border-dashed border-slate-300 bg-white/80 p-4 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Responsable por fase en HS
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                En HS, el responsable de la produccion depende de la fase: Asbuilt y Redesign usan
                el <strong>assignee</strong> de la tarea, mientras que Design usa el campo
                personalizado <strong>DESIGN ASSIGNEE</strong>. El estado actual de la tarea tambien
                se exporta en el Excel de HS para poder auditarlo.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">Notas importantes</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Si una tarea no aparece en un reporte, lo primero que hay que revisar es si el campo
                de completion date correspondiente realmente esta cargado en ClickUp. Los reportes
                solo usan esos campos de fecha para decidir que entra en el mes seleccionado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BauReport />
      <HsReport />
      <TrueNetReport />
    </main>
  );
}

export default IncomeReports;
