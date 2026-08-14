"use client";

import { AuthLayout } from "@/components/layouts/auth-layout";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { useAppSelector } from "@/lib/store/hooks";
import { selectLoginError, clearLoginError } from "@/lib/store/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff, ChevronDown, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

const PHONE_PREFIX = "+251";

export function LoginForm() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const loginError = useAppSelector(selectLoginError);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (loginError) {
      setError(loginError);
      dispatch(clearLoginError());
    }
  }, [loginError, dispatch]);

  const handleMethodChange = (m: "email" | "phone") => {
    setMethod(m);
    setErrors({});
    setError("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    const normalized = digits.startsWith("9") ? digits.slice(0, 9) : `9${digits}`.slice(0, 9);
    setPhoneDigits(normalized);
    if (errors.identifier) setErrors({ ...errors, identifier: "" });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "email" && !identifier) {
      setErrors({ identifier: "Email is required" });
      return;
    }
    if (method === "phone" && phoneDigits.length < 9) {
      setErrors({ identifier: "Enter a valid 9-digit phone number" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (method === "email") {
        await login(identifier.trim().toLowerCase(), password, undefined);
      } else {
        await login(undefined, password, `${PHONE_PREFIX}${phoneDigits}`);
      }

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center mb-8 animate-in fade-in duration-500">
        <div className="flex justify-center mb-4">
          <img
            src="/login-brand.png"
            alt="Peace and Security Logo"
            className="object-contain"
            style={{ width: 117, height: 117 }}
          />
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-[#0c2340] tracking-tight">
          Admin Sign In
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm mb-6 animate-in fade-in duration-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div className="text-left">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Sign in</h3>
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Email or Phone Number
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMethod(method === "email" ? "phone" : "email")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {method === "email" ? (
                  <>
                    <Mail size={14} /> Use Phone Number
                  </>
                ) : (
                  <>
                    <Phone size={14} /> Use Email
                  </>
                )}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {method === "email" ? (
            <Input
              type="text"
              placeholder="Enter your email"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errors.identifier) setErrors({ ...errors, identifier: "" });
              }}
              disabled={loading}
              className={`h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.identifier ? "border-destructive bg-destructive/5" : ""
              }`}
              autoFocus
              required
            />
          ) : (
            <div
              className={`flex h-12 bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all ${
                errors.identifier ? "border-destructive bg-destructive/5" : ""
              }`}
            >
              <span className="inline-flex items-center px-3 text-sm font-semibold text-slate-600 bg-slate-100 border-r border-slate-200">
                {PHONE_PREFIX}
              </span>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="9XXXXXXXX"
                value={phoneDigits}
                onChange={handlePhoneChange}
                disabled={loading}
                className="h-full flex-1 border-0 rounded-none bg-transparent px-3 text-sm focus:ring-0"
                autoFocus
                required
              />
            </div>
          )}
          {errors.identifier && (
            <p className="text-[11px] text-destructive font-bold pl-2 pt-0.5">
              {errors.identifier}
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              disabled={loading}
              autoComplete="current-password"
              className={`h-12 bg-white border border-slate-200 rounded-xl px-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.password ? "border-destructive bg-destructive/5" : ""
              }`}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-destructive font-bold pl-2 pt-0.5">
              {errors.password}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline cursor-pointer transition-colors"
              onClick={() => {
                toast.info("Please contact your system administrator to reset your password.");
              }}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-xl mt-4"
          disabled={
            loading ||
            (method === "email" ? !identifier : phoneDigits.length < 9) ||
            !password
          }
        >
          {loading ? "Verifying..." : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
}
