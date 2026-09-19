import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTenant } from "@/features/tenant/tenantQueries";
import Modal from "@/components/ui/Modal";
import { GlassButton } from "@/components/glass/GlassButton";
import { Input } from "@/components/ui/Input";
import type { Tenant } from "@/types/domain";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
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
    <Modal open={open} onClose={onClose} title="Edit Organization Profile" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
            Organization Name
          </label>
          <Input
            {...register("name")}
            error={errors.name?.message}
            className="bg-neutral-50 dark:bg-[#080d1a] border-neutral-200 dark:border-white/10"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
            Subscription Tier
          </label>
          <Controller
            name="plan"
            control={control}
            render={({ field }) => (
              <select
                value={field.value}
                onChange={field.onChange}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all"
              >
                <option value="FREE">Free Tier</option>
                <option value="PRO">Pro Tier</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-white/[0.08]">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            isLoading={update.isPending}
            disabled={!isDirty}
            className="font-bold shadow-lg shadow-accent-cyan/25"
          >
            Save Changes
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
}
