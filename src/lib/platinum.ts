import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getProfile, type Profile } from "@/lib/server/account";

export function usePlatinum() {
  const user = useCurrentUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setReady(true);
      return;
    }
    let cancelled = false;
    void getProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    ready,
    profile,
    active: Boolean(profile?.platinumActive),
    isPremium: Boolean(profile?.isPremium),
    trialDaysLeft: profile?.trialDaysLeft ?? 0,
  };
}
