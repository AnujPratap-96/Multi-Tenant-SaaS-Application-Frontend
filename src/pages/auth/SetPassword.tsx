import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/ui/PasswordInput";
import api from "../../lib/axios";
import { useAuthStore } from "../../features/auth/authStore";
import { errorMessage } from "../../lib/errors";
import type { User } from "@/types/domain";

const setPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SetPasswordInput = z.infer<typeof setPasswordSchema>;

export default function SetPassword() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: SetPasswordInput) => {
    try {
      setError("");
      const response = await api.post<{ data: { user: User } }>("/auth/set-password", {
        password: data.password,
      });
      if (response.data?.data?.user) {
        login(response.data.data.user);
        navigate("/dashboard");
      } else {
        setError("Failed to set password: user data not received");
      }
    } catch (err) {
      setError(errorMessage(err, "Failed to set password"));
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure your account</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Create a strong password to finish setting up your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <PasswordInput
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Complete Signup
        </Button>
      </form>
    </div>
  );
}
