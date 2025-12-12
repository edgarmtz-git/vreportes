import InvoiceDashboard from "@/components/dashboard/invoice-dashboard";

export default function Dashboard() {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      {/* Componente principal del dashboard */}
      <InvoiceDashboard />
    </div>
  );
}
