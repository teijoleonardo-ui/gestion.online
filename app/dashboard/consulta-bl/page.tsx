"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ConsultaContratantePanel } from "@/components/consulta-bl/consulta-contratante-panel";

export default function ConsultaBLPage() {
  return (
    <Suspense fallback={null}>
      <ConsultaBLContent />
    </Suspense>
  );
}

function ConsultaBLContent() {
  const searchParams = useSearchParams();
  const contratante = searchParams?.get("contratante") ?? "";
  return <ConsultaContratantePanel contratanteParam={contratante} />;
}
