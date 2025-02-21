import { userService } from "@/services/user-service";
import { useQuery } from "@tanstack/react-query";

export function useUsers() {
  const {
    data: users = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
  });

  return {
    users,
    isLoading,
    refetch
  };
} 