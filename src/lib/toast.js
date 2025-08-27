import { toast } from "react-toastify";
export const toastError = (m) => toast.error(m || "Xatolik");
export const toastSuccess = (m) => toast.success(m || "OK");
