import { getPresignedUrl } from "../../../services/api/media";

export const getPresignedUrlAction = (payload) => async () => {
    try {
        const res = await getPresignedUrl(payload);
        return res;
    } catch (error) {
        console.error("Error fetching presigned URL:", error);
    }
};