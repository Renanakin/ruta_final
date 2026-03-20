import React from 'react';

const CRMStats = ({ stats, cancellationRate }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-3xl font-black text-stone-900">{stats.total}</div>
        <div className="text-sm text-stone-500 font-medium">Total Pedidos</div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-3xl font-black text-yolk-600">{stats.nuevo}</div>
        <div className="text-sm text-stone-500 font-medium">Nuevos</div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-3xl font-black text-blue-600">{stats.confirmado}</div>
        <div className="text-sm text-stone-500 font-medium">Confirmados</div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-3xl font-black text-green-600">{stats.entregado}</div>
        <div className="text-sm text-stone-500 font-medium">Entregados</div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-3xl font-black text-red-600">{cancellationRate}%</div>
        <div className="text-sm text-stone-500 font-medium">Tasa Cancelación</div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-3xl font-black text-brand-700">
          ${stats.ticketPromedio.toLocaleString('es-CL')}
        </div>
        <div className="text-sm text-stone-500 font-medium">Ticket Promedio</div>
      </div>
    </div>
  );
};

export default CRMStats;
