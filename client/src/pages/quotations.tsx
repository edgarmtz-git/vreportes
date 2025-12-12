import QuotationDashboard from "@/components/dashboard/quotation-dashboard";

export default function Quotations() {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      {/* Componente principal del dashboard */}
      <QuotationDashboard />
    </div>
  );
}

