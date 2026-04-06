import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = () => {
  let id = sessionStorage.getItem("analytics_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("analytics_sid", id);
  }
  return id;
};

export const usePageTracking = () => {
  const location = useLocation();
  const lastPath = useRef("");

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    const trackPageView = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("page_views" as any).insert({
        page_path: path,
        user_id: user?.id || null,
        session_id: getSessionId(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });
    };

    trackPageView().catch(() => {});
  }, [location.pathname]);
};
