"use client";
import { useEffect } from "react";
import { getPublicAppConfig } from "@/lib/api";
import { useAppConfigStore } from "@/store/useAppConfigStore";

export default function AppConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setConfig = useAppConfigStore((s) => s.setConfig);

  useEffect(() => {
    getPublicAppConfig()
      .then((res) => {
        if (res.success && res.data) {
          setConfig(res.data);
          // console.log("App config: ", res.data);
        }
      })
      .catch(() => {});
  }, [setConfig]);

  return <>{children}</>;
}
