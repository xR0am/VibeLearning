import { useQuery } from "@tanstack/react-query";

export interface OpenRouterModel {
  id: string;
  name: string;
}

export function useModels() {
  const { data: models = [], isLoading, error } = useQuery<OpenRouterModel[]>({
    queryKey: ["/api/models"],
  });

  return {
    models,
    isLoading,
    isError: !!error
  };
}