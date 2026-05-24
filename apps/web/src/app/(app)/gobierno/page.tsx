import { Card, CardContent, SectionHeader } from '@faro/ui';

export default function OrdenInterno() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader title="Orden Interno" description="Secciones, roles, tareas y reseteo de claves por OTP (sin blanqueo a texto plano como GIB)" />
      <Card>
        <CardContent className="p-5">
          <ul className="space-y-2 text-sm">
            <li>• Sección Operativa · 14 integrantes · Mariana Pereyra (jefa)</li>
            <li>• Sección Cadetes · 2 integrantes</li>
            <li>• Sección Administrativa · 3 integrantes · Diego Fernández</li>
            <li>• Sección Ética y Género · 1 integrante · Florencia Salinas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
