import { SplidClient } from "splid-js";

export const fetchProxy: typeof fetch = async (url, init) => {
  const res = await fetch("/api/http-proxy", {
    method: "POST",
    body: JSON.stringify({ url, init }),
  });
  return res;
};

export default function useSplid() {
  const splid = new SplidClient({ fetch: fetchProxy });

  return splid;
}
