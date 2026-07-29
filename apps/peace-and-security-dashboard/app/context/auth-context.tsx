"use client"

import { useCallback, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import {
  selectUser,
  selectAuthLoading,
  selectIsServerActive,
  selectIsCheckingServer,
  userLogin,
  initAuth,
  setUser,
  logout as logoutAction,
} from "@/lib/store/authSlice"
import { type User } from "@/lib/auth"
import { UserRole } from "@/lib/enums"
import { DEFAULT_PERMISSIONS_BY_ROLE } from "@/lib/permissions"

export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const loading = useAppSelector(selectAuthLoading)
  const isServerActive = useAppSelector(selectIsServerActive)
  const isCheckingServer = useAppSelector(selectIsCheckingServer)

  useEffect(() => {
    dispatch(initAuth())
  }, [dispatch])

  const login = useCallback(
    async (email?: string, password: string = "", phoneNumber?: string) => {
      const result = await dispatch(userLogin({ email, password, phoneNumber })).unwrap()
      return result
    },
    [dispatch]
  )

  const loginWithData = useCallback(
    (userData: User) => {
      dispatch(setUser(userData))
    },
    [dispatch]
  )

  const logout = useCallback(() => {
    dispatch(logoutAction())
  }, [dispatch])

  const canAccess = useCallback(
    (requiredRoles: UserRole[]) => {
      if (!user) return false
      return requiredRoles.includes(user.role)
    },
    [user]
  )

  const hasPermission = useCallback(
    (permission: string): boolean => {
      let currentRole: string | undefined = user?.role
      if (!currentRole && typeof window !== "undefined") {
        const stored = localStorage.getItem("user")
        if (stored) {
          try {
            currentRole = JSON.parse(stored).role
          } catch {}
        }
      }

      if (!currentRole) return false

      const roleName = currentRole.toString().toUpperCase()

      if (
        roleName === "SYSTEM_SUPER_ADMIN" ||
        roleName === "SYSTEM_ADMIN" ||
        roleName.includes("ADMIN") ||
        roleName.includes("VIEWER")
      ) {
        return true
      }

      if (user?.permissions && Array.isArray(user.permissions)) {
        if (user.permissions.includes(permission)) return true
      }

      const defaultPerms =
        DEFAULT_PERMISSIONS_BY_ROLE[currentRole] ||
        DEFAULT_PERMISSIONS_BY_ROLE[roleName] ||
        []
      return defaultPerms.includes(permission)
    },
    [user]
  )

  return {
    user,
    loading,
    isServerActive,
    isCheckingServer,
    login,
    loginWithData,
    logout,
    canAccess,
    hasPermission,
  }
}
