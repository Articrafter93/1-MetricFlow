export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-slate-100">
      <h1 className="text-3xl font-semibold">Politica de Privacidad</h1>
      <p className="mt-4 text-sm text-slate-300">
        MetricFlow recolecta solo datos necesarios para autenticacion, operacion del
        workspace y analitica del servicio. Los datos se tratan bajo principios de minimizacion,
        finalidad y seguridad.
      </p>
      <p className="mt-3 text-sm text-slate-300">
        Puedes solicitar acceso, correccion o eliminacion de tus datos escribiendo al canal
        de soporte definido por tu agencia.
      </p>
      <p className="mt-3 text-sm text-slate-300">
        Retencion estandar: 12 meses para logs operativos y 24 meses para auditoria de
        reportes, salvo obligaciones legales distintas.
      </p>
    </main>
  );
}
