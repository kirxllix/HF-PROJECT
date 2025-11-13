// src/pages/admin/ReportesPage.jsx (NUEVO ARCHIVO)

import React from 'react';

// Esta página usará las rutas de backend:
// /api/v1/admin/reports/inventory/:sucursalId/:date
// /api/v1/admin/reports/times/:sucursalId/:date

const ReportesPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
        Reportes Específicos
      </h1>
      
      {/* Aquí irá la lógica para el "Selector de Fecha" 
        y para llamar a las APIs de reportes
      */}
      <p>Próximamente: Selector de fecha y sucursal para ver reportes de Tiempos y Pérdidas de Inventario.</p>
      <p>(El backend para esto ya está listo)</p>
    </div>
  );
};

export default ReportesPage;