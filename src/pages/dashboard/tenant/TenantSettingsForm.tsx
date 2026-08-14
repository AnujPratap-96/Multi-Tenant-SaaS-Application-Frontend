import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTenantSettings, useUpdateSettings } from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  allowPublicSignup: z.boolean().optional(),
  defaultRole: z.enum(["ADMIN", "MANAGER", "USER"]).optional(),
  maxMembers: z.number().min(1).max(10000).optional(),
});

type SettingsValues = z.infer<typeof schema>;

export default function TenantSettingsForm() {
  const { currentTenant } = useTenantStore();
  const { data, isLoading } = useTenantSettings(currentTenant?.id);
  const update = useUpdateSettings(currentTenant?.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(schema),
    values: (data as SettingsValues | undefined) ?? {},
  });

  const onSubmit = (values: SettingsValues) => update.mutate({ settings: values });

  if (isLoading) return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Members</label>
        <Input type="number" {...register("maxMembers", { valueAsNumber: true })} error={errors.maxMembers?.message} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Role</label>
        <select
          {...register("defaultRole")}
          className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="USER">User</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="publicSignup"
          {...register("allowPublicSignup")}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="publicSignup" className="text-sm text-gray-700 dark:text-gray-300">
          Allow public sign-up to join this organization
        </label>
      </div>
      <Button type="submit" isLoading={update.isPending} disabled={!isDirty}>
        Save Settings
      </Button>
    </form>
  );
}
