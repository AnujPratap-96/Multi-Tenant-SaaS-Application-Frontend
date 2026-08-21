import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTenant } from "@/features/tenant/tenantQueries";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Tenant } from "@/types/domain";

const schema = z.object({
  name: z.string().min(2).max(100).optional(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
});

type EditTenantInput = z.infer<typeof schema>;

interface EditTenantModalProps {
  open: boolean;
  onClose: () => void;
  tenant: Tenant | null | undefined;
}

export default function EditTenantModal({ open, onClose, tenant }: EditTenantModalProps) {
  const update = useUpdateTenant(tenant?.id);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditTenantInput>({
    resolver: zodResolver(schema),
    values: { name: tenant?.name || "", plan: (tenant?.plan as EditTenantInput["plan"]) || "FREE" },
  });

  const onSubmit = (data: EditTenantInput) => {
    update.mutate(data, { onSuccess: onClose });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Organization">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Organization name
          </label>
          <Input {...register("name")} error={errors.name?.message} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
          <Controller
            name="plan"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </Select>
            )}
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={update.isPending} disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
