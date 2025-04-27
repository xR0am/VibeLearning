import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useOpenRouterSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: saveApiKey, isPending } = useMutation({
    mutationFn: async (apiKey: string) => {
      return await apiRequest("/api/user/apikey", {
        method: "POST",
        body: JSON.stringify({ apiKey }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "API Key Saved",
        description: "Your OpenRouter API key has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save API key: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    saveApiKey,
    isSaving: isPending,
  };
}