export const supabaseProjectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
export const supabasePublishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";

export function supabasePublicHeaders(): Record<string, string> {
  return {
    apikey: supabasePublishableKey,
    Accept: "application/json",
  };
}
