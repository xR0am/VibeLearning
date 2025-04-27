import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export function useOpenRouterSettings() {
  const queryClient = useQueryClient();
  
  const { mutate: saveApiKey, isPending: isSaving } = useMutation({
    mutationFn: async (apiKey: string) => {
      return await apiRequest(
        "POST",
        "/api/user/openrouter-key", 
        { apiKey }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
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

  return {
    saveApiKey,
    isSaving
  };
}