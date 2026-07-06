import { useState } from 'react';
import { 
  useMachines, 
  useCreateMachine, 
  useUpdateMachine, 
  useDeleteMachine 
} from '../hooks/useMachines';
import { MachineForm } from '../components/MachineForm';
import type { Machine, MachineCreateInput, MachineUpdateInput } from '@frms/shared';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Search, Cog, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components';
import { SkeletonTable, EmptyState, StatusBadge } from '@/components/feedback';

export function MachineList() {
  const { data: machines, isLoading } = useMachines();
  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();
  const deleteMachine = useDeleteMachine();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | undefined>();

  const filteredMachines = machines?.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: MachineCreateInput) => {
    createMachine.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handleUpdate = (data: MachineCreateInput) => {
    if (!editingMachine) return;
    updateMachine.mutate(
      { id: editingMachine.id, data: data as MachineUpdateInput },
      {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingMachine(undefined);
        },
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete machine "${name}"?`)) {
      deleteMachine.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader 
          title="Machines" 
          description="Manage factory equipment and maintenance statuses"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingMachine(undefined);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Plus className="h-4 w-4" />
            Add Machine
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search machines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} columns={3} />
          </div>
        ) : !filteredMachines || filteredMachines.length === 0 ? (
          <EmptyState
            icon={<Cog className="h-8 w-8 text-muted-foreground" />}
            title="No machines found"
            description={
              search ? 'Try adjusting your search criteria.' : 'Get started by adding your first factory machine.'
            }
            action={
              !search ? (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Machine
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Machine Name</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {filteredMachines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Cog className="h-4 w-4" />
                        </div>
                        {machine.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={machine.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingMachine(machine);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Edit machine"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(machine.id, machine.name)}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete machine"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Machine Modal */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl bg-card p-6 shadow-xl border border-border z-50 animate-scale-in max-h-[90dvh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold text-foreground mb-1">
              {editingMachine ? 'Edit Machine' : 'Add New Machine'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-4">
              {editingMachine ? 'Update equipment details below.' : 'Enter equipment details to add a new machine to inventory.'}
            </Dialog.Description>

            <MachineForm
              initialData={editingMachine}
              onSubmit={editingMachine ? handleUpdate : handleCreate}
              isLoading={createMachine.isPending || updateMachine.isPending}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingMachine(undefined);
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
