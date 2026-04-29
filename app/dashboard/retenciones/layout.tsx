/**
 * Encadena altura con el <main> del dashboard (h-full + min-h-0) para que el scroll
 * del contenido viva en la columna de retenciones y el header quede estable.
 */
export default function RetencionesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full max-h-full min-h-0 min-w-0 flex-col overflow-hidden">{children}</div>
  );
}
