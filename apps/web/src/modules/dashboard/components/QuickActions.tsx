import { useNavigate } from 'react-router-dom';
import { Plus, Banknote, UserPlus, Factory } from 'lucide-react';
import { ROUTES } from '@/constants';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Production',
      icon: Plus,
      color: 'bg-orange-500/10 text-orange-600',
      onClick: () => navigate(ROUTES.PRODUCTION.NEW),
    },
    {
      label: 'Pending Approvals',
      icon: Factory,
      color: 'bg-blue-500/10 text-blue-600',
      onClick: () => navigate(ROUTES.PRODUCTION.LIST, { state: { status: 'PENDING' } }),
    },
    {
      label: 'Generate Payroll',
      icon: Banknote,
      color: 'bg-green-500/10 text-green-600',
      onClick: () => navigate(ROUTES.PAYROLL.DASHBOARD),
    },
    {
      label: 'Add Employee',
      icon: UserPlus,
      color: 'bg-purple-500/10 text-purple-600',
      onClick: () => navigate(ROUTES.MASTERS.EMPLOYEES), // Ideally opens a modal
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${action.color}`}>
            <action.icon className="h-3.5 w-3.5" />
          </div>
          {action.label}
        </button>
      ))}
    </div>
  );
}
