import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export function useOpenRouterSettings() {
  const queryClient = useQueryClient();
  
  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: async (apiKey: string) => {
      return await apiRequest(
        "POST",
        "/api/user/openrouter-key", 
        { apiKey }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "API Key Updated",
        description: "Your OpenRouter API key has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving API Key",
        description: "There was a problem saving your API key. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving API key:", error);
    }
  });
  
  const saveApiKey = (apiKey: string, callbacks?: { onSuccess?: () => void; onError?: () => void }) => {
    mutate(apiKey, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        console.error("Error saving API key:", error);
        callbacks?.onError?.();
      }
    });
  };

  return {
    saveApiKey,
    isSaving
  };
}