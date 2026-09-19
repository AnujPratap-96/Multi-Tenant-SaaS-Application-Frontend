import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { useCreateInvite } from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import Modal from "@/components/ui/Modal";
import { GlassButton } from "@/components/glass/GlassButton";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MANAGER", "USER"]),
});

type InviteMemberInput = z.infer<typeof schema>;

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const { currentTenant } = useTenantStore();
  const create = useCreateInvite(currentTenant?.id ?? "");
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(schema),
    defaultValues: { role: "USER" },
  });

  const onSubmit = (data: InviteMemberInput) => {
    create.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite Team Member" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
            Work Email Address *
          </label>
          <Input
            {...register("email")}
            type="email"
            placeholder="colleague@company.com"
            error={errors.email?.message}
            autoFocus
            className="bg-neutral-50 dark:bg-[#080d1a] border-neutral-200 dark:border-white/10"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
            Initial Role & Access Level
          </label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <select
                value={field.value}
                onChange={field.onChange}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all"
              >
                <option value="USER">User (Task execution and collaboration)</option>
                <option value="MANAGER">Manager (Workspace and sprint administration)</option>
                <option value="ADMIN">Admin (Full organization governance)</option>
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
            isLoading={create.isPending}
            leadingIcon={<Send className="h-4 w-4" />}
            className="font-bold shadow-lg shadow-accent-cyan/25"
          >
            Send Invitation
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
}
