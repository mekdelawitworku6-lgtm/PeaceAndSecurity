"use client";
import { UserRole } from "@/lib/auth";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/context/auth-context";
import { UserForm } from "@/components/forms/user-form";
import { userService } from "@/lib/services/user-service";
import { patrolService } from "@/lib/services/patrol-service";

export default function CreateUserPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { canAccess } = useAuth();
    const [loading, setLoading] = useState(false);

    // Read optional ?role= query param  (e.g. "PATROL" from the Patrols page)
    const roleParam = searchParams.get("role") as UserRole | null;

    if (!canAccess([UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN])) {
        return <div className="p-6 text-center">Access Denied</div>;
    }

    const handleSave = async (data: FormData) => {
        setLoading(true);
        const role = (data.get("role") as string) || roleParam || "";

        const loadingToast = toast.loading(
            role === UserRole.PATROL ? "Registering patrol officer..." : "Creating system user..."
        );

        try {
            if (role === UserRole.PATROL) {
                await patrolService.registerPatrol(data);
            } else {
                await userService.registerUser(data);
            }

            const successMsg =
                role === UserRole.PATROL
                    ? "Patrol officer registered! Login credentials sent via SMS."
                    : "User created successfully";

            toast.success(successMsg, { id: loadingToast });

            // Redirect to correct list page
            if (role === UserRole.PATROL) {
                router.push("/dashboard/patrols");
            } else {
                router.push("/dashboard/users");
            }
            router.refresh();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create user";
            toast.error(msg, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <UserForm
                onSave={handleSave}
                onOpenChange={() => {
                    if (roleParam === UserRole.PATROL) {
                        router.push("/dashboard/patrols");
                    } else {
                        router.push("/dashboard/users");
                    }
                }}
                isLoading={loading}
                isNew={true}
                defaultRole={roleParam || undefined}
            />
        </>
    );
}
