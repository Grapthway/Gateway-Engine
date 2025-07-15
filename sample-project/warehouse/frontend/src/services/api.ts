export const BACKEND_URL = (process?.env?.NEXT_PUBLIC_BACKEND_URL as string) ?? "http://localhost:5000";
export const AUTH_URL = (process?.env?.NEXT_PUBLIC_BACKEND_URL as string) ?? "http://localhost:5000/auth";
export const CATEGORY_URL = (process?.env?.NEXT_PUBLIC_BACKEND_URL as string) ?? "http://localhost:5000/category";
export const INVENTORY_URL = (process?.env?.NEXT_PUBLIC_BACKEND_URL as string) ?? "http://localhost:5000/inventory";
export const WAREHOUSE_ACTIVITY_URL = (process?.env?.NEXT_PUBLIC_WAREHOUSE_ACTIVITY_URL as string) ?? "http://localhost:5000/warehouse";
export const SHIPPING_URL = (process?.env?.NEXT_PUBLIC_SHIPPING_URL as string) ?? "http://localhost:5000/shipping";
export const BACKEND_URL_WS = 'ws://localhost:5000';
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { useEffect, useRef, useState } from "react";

interface Headers {
  [key: string]: string;
}

export function createAPIWrapper(baseUrl: string) {
  async function restRequest<T>(
    method: string,
    path: string,
    data?: any,
    queryParams?: Record<string, string>
  ): Promise<any> {
    const url = `${baseUrl}${path}`;

    // Read tokens dynamically every time a request is made
    const accessToken = localStorage?.getItem("X-Access-Token");
    const authToken = localStorage?.getItem("Authorization");
    const storeToken = localStorage?.getItem("Store-Token");

    const headers: Headers = {};

    if (accessToken) {
      headers["X-Access-Token"] = accessToken;
    }

    if (authToken) {
      headers["Authorization"] = authToken;
    }

    if (storeToken) {
      headers["Store-Token"] = storeToken;
    }

    // Build the Axios config
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      params: queryParams,
      headers,
    };

    // If this is GET /user/profile/get, we expect a Blob (binary data)
    if (method.toUpperCase() === "GET" && path === "/user/profile/get") {
      config.responseType = "blob";
    }

    try {
      const response: AxiosResponse<T> = await axios(config);
      // If responseType is "blob", response.data will be a Blob
      // Otherwise, it will be JSON or text based on server response
      return response.data ?? response;
    } catch (error: any) {
      if (error?.message === "Network Error") {
        throw new Error("System sedang dalam perbaikan, coba lagi nanti");
      }
      throw error;
    }
  }

    async function graphqlRequest<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const url = `${baseUrl}/graphql`;

    // pull tokens just like in restRequest
    const accessToken = localStorage?.getItem("X-Access-Token");
    const authToken = localStorage?.getItem("Authorization");
    const storeToken = localStorage?.getItem("Store-Token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) headers["X-Access-Token"] = accessToken;
    if (authToken) headers["Authorization"] = authToken;
    if (storeToken) headers["Store-Token"] = storeToken;

    const config: AxiosRequestConfig = {
      method: "POST",
      url,
      headers,
      data: { query, variables },
    };

    try {
      const response = await axios<T>(config);
      // GraphQL errors come back in `response.data.errors`
      if ((response.data as any).errors) {
        throw new Error((response.data as any).errors[0].message);
      }
      return (response.data as any).data;
    } catch (err: any) {
      if (err.message === "Network Error") {
        throw new Error("System sedang dalam perbaikan, coba lagi nanti");
      }
      throw err;
    }
  }

  return {
    restRequest,
    graphqlRequest,
  };
}

export const api = createAPIWrapper(BACKEND_URL);

export const useWebSocket = (baseUrl: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Read tokens dynamically when creating connection
    const accessToken = localStorage?.getItem("X-Access-Token");
    const authToken = localStorage?.getItem("Authorization");
    const storeToken = localStorage?.getItem("Store-Token");

    // Build query parameters for authentication
    const params = new URLSearchParams();
    
    if (accessToken) {
      params.append("accessToken", accessToken);
    }
    
    if (authToken) {
      params.append("authToken", authToken);
    }
    
    if (storeToken) {
      params.append("storeToken", storeToken);
    }

    // Create WebSocket URL with query parameters
    const wsUrl = `${baseUrl}?${params.toString()}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [baseUrl]);

  // Function to send messages
  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, messages, sendMessage };
};
