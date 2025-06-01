import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const supabase = createClient();

export const getCurrentUser = async () => {
  const client = createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  return { user, error };
};

export const getSessionToken = async () => {
  const client = createClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  return session?.access_token || null;
};

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getSessionToken();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://journalshe-server.azakiyasabrina.workers.dev";

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};
