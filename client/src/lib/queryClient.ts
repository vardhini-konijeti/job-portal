import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "../config"; // <-- Assumes config.ts is one directory up

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {

  // 1. Combine the base URL with the relative path
  const fullUrl = API_BASE_URL + url; 
  
  // 2. Use the fullUrl in the fetch call
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // 1. Get the path, e.g., 'api/jobs'
    const relativePath = queryKey.join("/") as string;

    // 2. Combine the base URL and the path to get the final URL
    // We add an extra '/' just in case the path doesn't start with one.
    const fullUrl = API_BASE_URL + "/" + relativePath; 
    
    // 3. Use the fullUrl in the fetch call
    const res = await fetch(fullUrl, { // <-- This line is modified
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
