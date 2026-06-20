import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Admin panel</p>
            <h1 className="text-3xl font-bold tracking-normal">Store operations</h1>
          </div>
          <AdminNav />
        </div>
        {children}
      </div>
    </section>
  );
}
