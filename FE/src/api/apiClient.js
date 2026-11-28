import axios from "axios";
import { reissueKakaoToken } from "./Auth/kakaoAuthApi.js";
import { useAuthStore } from "../stores/useAuthStore.js";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let isAuthErrorAlerted = false;

// Request 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.isSuccess === false) {
      const apiError = new Error(response.data.message || "API 요청 처리 중 문제가 발생했습니다.");
      apiError.response = response;
      return Promise.reject(apiError);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    // 운영 서버는 유효하지 않은 JWT에 대해 응답 본문 없이 403을 반환한다.
    const isAuthenticationError =
      status === 401 || (status === 403 && !error.response?.data);

    if (isAuthenticationError && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const { login } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error("리프레시 토큰이 없습니다.");
        }

        const newTokens = await reissueKakaoToken(refreshToken, accessToken);

        if (login) login(newTokens.accessToken, newTokens.refreshToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (reissueError) {
        console.error("토큰 재발급 실패:", reissueError);
        if (!isAuthErrorAlerted) {
          isAuthErrorAlerted = true;
          localStorage.removeItem("accessToken");
          const { logout } = useAuthStore.getState();
          if (logout) logout();
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          window.location.href = "/login";
        }
        return Promise.reject(reissueError);
      }
    } else if (status === 403) {
      console.warn("API 접근 권한이 없습니다 (403 Forbidden). 요청 url:", error.config?.url);
    }

    if (error.response?.data?.message) {
      // Axios 오류 객체를 유지해야 호출부에서 status, code 등 상세 원인을 확인할 수 있다.
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
