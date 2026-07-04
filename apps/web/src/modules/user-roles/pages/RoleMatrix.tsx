import { SectionCard } from '@/components';

const PERMISSIONS = [
  { module: 'Dashboard', admin: 'Full Access', supervisor: 'Full Access', operator: 'Read-only' },
  { module: 'Master Data', admin: 'Create/Edit/Deactivate', supervisor: 'View Only', operator: 'View Only' },
  { module: 'Production', admin: 'Full Access', supervisor: 'Full Access', operator: 'Create/View' },
  { module: 'Payroll', admin: 'Generate/Lock/View', supervisor: 'View Only', operator: 'No Access' },
  { module: 'Notifications', admin: 'Manage', supervisor: 'View Own', operator: 'View Own' },
  { module: 'Data Mgmt', admin: 'Full Access', supervisor: 'No Access', operator: 'No Access' },
  { module: 'User Mgmt', admin: 'Full Access', supervisor: 'No Access', operator: 'No Access' },
  { module: 'Settings', admin: 'Full Access', supervisor: 'View Only', operator: 'No Access' },
];

export function RoleMatrix() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Roles & Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Formal definitions of system access levels 
        </p>
      </div>

      <SectionCard>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-muted/30">
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground w-[25%]">Module / Action</th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-primary">ADMIN</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">SUPERVISOR</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">OPERATOR</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {PERMISSIONS.map((row) => (
                <tr key={row.module} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium text-foreground">{row.module}</td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                      {row.admin}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">{row.supervisor}</td>
                  <td className="p-4 align-middle text-muted-foreground">{row.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
