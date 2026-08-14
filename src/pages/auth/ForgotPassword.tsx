import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import api from "../../lib/axios";
import { errorMessage } from "../../lib/errors";

const forgotPasswordOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordOtpSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordOtpSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setError("");
      const response = await api.post<{ data: { requestId: string } }>(
        "/auth/forgot-password-otp",
        data
      );
      navigate("/verify-otp", {
        state: {
          email: data.email,
          requestId: response.data.data.requestId,
          purpose: "FORGOT_PASSWORD",
        },
      });
    } catch (err) {
      setError(errorMessage(err, "Failed to process request"));
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Enter your email and we'll send you an OTP to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email address
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Send OTP
        </Button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
