import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a signed URL for a private storage path.
 * If the path is already a full URL (legacy data), returns it as-is.
 */
export function useSignedUrl(storagePath: string | null | undefined, bucket = "selfies") {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storagePath) {
      setUrl(null);
      return;
    }

    // Legacy: if it's already a full URL, use it directly
    if (storagePath.startsWith("http")) {
      setUrl(storagePath);
      return;
    }

    supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) {
          setUrl(data.signedUrl);
        }
      });
  }, [storagePath, bucket]);

  return url;
}
