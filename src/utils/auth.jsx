// src/utils/auth.jsx
import { storage } from "./storage";

export const isLoggedIn = () => {
    return !!storage.get("token") && !!storage.get("isLoggedIn");
};

export const logout = () => {
    // Xóa đúng các key bạn set khi login (hoặc dùng storage.clear())
    storage.remove("token");
    storage.remove("isLoggedIn");
    storage.remove("userEmail");
    storage.remove("id");
    storage.remove("userName");
    storage.remove("userPhone");
    storage.remove("serviceCenterId");
    storage.remove("requiresPasswordChange");
    storage.remove("loginType");

    // Nếu bạn muốn xóa sạch mọi thứ:
    // storage.clear();
};