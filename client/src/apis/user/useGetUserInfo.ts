import { UserInfo } from "@/types/userInfo";
import client from "@/apis/core/client";

const getUserInfo = () => {
  return client.get<UserInfo>({
    url: "/user/me",
  });
};

export default getUserInfo;
