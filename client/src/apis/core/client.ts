import axios, { AxiosInstance, AxiosRequestConfig, Method } from "axios";
import qs from "qs";
import { toast } from "react-toastify";
import { ApiResponse } from "@/apis/core/type";
import useAuthStore from "@/store/useAuthStore";

// axios 인스턴스 생성
// axios.create()를 사용해서 커스텀 설정을 가진 새로운 axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  // 모든 요청의 기본 URL을 설정. 환경 변수에서 가져옴
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  // 요청 타임아웃을 10초로 설정(요청 시작 후 10초내에 응답 안오면 자동으로 중단되고 에러 발생)
  timeout: 10000,
  // 기본 헤더 설정. JSON 형식의 데이터를 주고받겠다고 명시
  headers: { "Content-Type": "application/json" },
  // 모든 요청에 쿠키를 포함
  withCredentials: true,
  // 파라미터 직렬화. qs.stringify를 사용하여 객체를 쿼리 문자열로 변환
  // arrayFormat: "repeat"는 배열 파라미터를 반복하여 표현 (ex: arr=1&arr=2&arr=3).
  // ex) const params={name:'John',hobbies:['reading','swimming','cycling']}
  // => name=John&hobbies=reading&hobbies=wimming&hobbies=cycling
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 요청 인터셉터
// 요청이 서버로 보내지기 전에 실행되는 함수 정의
axiosInstance.interceptors.request.use(
  (config) => {
    // store에서 엑세스토큰을 가져옴
    const accessToken = useAuthStore.getState().accessToken;
    // 토큰이 있다면 요청 헤더에 Authorization 헤더를 추가
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    // 수정된 설정을 리턴
    return config;
  },
  // 에러가 발생하면 Promise.reject로 오류 전파
  (error) => Promise.reject(error)
);

// 응답 인터셉터
// 서버로부터 응답이 도착한 직후, then/catch로 처리되기 전에 실행되는 함수
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 액세스 토큰이 만료되어 401 에러가 발생한 경우(401은 엑세스토큰이 없을때, 만료되었을때 등 인증 쪽 문제가 생겼을때 반환)
    if (error.response.status === 401 && !originalRequest._retry) {
      // originalRequest에 _retry 속성 추가
      // 요청이 실패했을 때 이 요청을 재시도했는지 여부 추적
      // 처음에는이 속성이 없으니까 !originalRequest._retry는 true가 됨
      originalRequest._retry = true;
      // 재시도 하자마자 _retry는 true로 바꿔서 다음 요청부터는 더이상 재시도 하지 않도록

      try {
        const response = await axiosInstance.post<
          ApiResponse<{
            accessToken: string;
          }>
        >(`/auth/refresh`);

        const {
          data: { accessToken },
          success,
        } = response.data;

        if (!success) {
          throw new Error("토큰 재발급 오류");
        }
        // 새로운 액세스 토큰 저장
        useAuthStore.getState().setAccessToken(accessToken);
        // 원래 요청의 헤더 업데이트
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃 처리 & 로그인 페이지로 이동
        toast.error("인증이 만료되었습니다");
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    // 인터셉터에서 에러 처리를 못했을때, 에러를 호출했던 곳으로 다시 던짐
    return Promise.reject(error);
  }
);

// API 메서드 생성 함수
// axios 인스턴스와 HTTP 메서드 타입을 받아 새로운 함수를 반환
const createApiMethod =
  (axiosInstance: AxiosInstance, methodType: Method) =>
  <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    // axiosInstance를 호출하여 실제 HTTP 요청
    return axiosInstance({
      ...config, // 전달받은 설정을 그대로 사용하고
      method: methodType, // HTTP 메서드만 지정된 것으로 덮어씀
    }).then((res) => res.data);
  };

// HTTP 메서드 정의
const HTTP_METHODS = {
  GET: "get",
  POST: "post",
  PATCH: "patch",
  PUT: "put",
  DELETE: "delete",
} as const; // as const를 사용해서 이 객체가 변경되지 않음을 ts에 알려줌

// 클라이언트 객체 생성
// 각 HTTP 메서드에 대해 createApiMethod 함수를 호출해서 메서드별 함수 생성
const client = {
  get: createApiMethod(axiosInstance, HTTP_METHODS.GET),
  post: createApiMethod(axiosInstance, HTTP_METHODS.POST),
  patch: createApiMethod(axiosInstance, HTTP_METHODS.PATCH),
  put: createApiMethod(axiosInstance, HTTP_METHODS.PUT),
  delete: createApiMethod(axiosInstance, HTTP_METHODS.DELETE),
};

// 생성된 client 객체를 export
// 사용할때 import 하고 axios.get 하던걸 client.get하면 됨
export default client;
