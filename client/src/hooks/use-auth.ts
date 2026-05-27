import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types";

export type { User };
import { apiFetch, getToken, clearTokens, storeTokens } from "@/lib/api";

async function fetchUser(): Promise<User | null> {
  if (!getToken()) return null;
  try {
    const { user } = await apiFetch<{ user: User }>("/auth/me");
    return user;
  } catch {
    clearTokens();
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } catch {
        /* clear locally even if API fails */
      }
      clearTokens();
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  const setUser = (u: User, token: string, refreshToken?: string) => {
    storeTokens(token, refreshToken);
    queryClient.setQueryData(["auth", "me"], u);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    setUser,
  };
}
