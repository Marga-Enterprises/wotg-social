import { GET, POST_FORM_DATA, PUT_FORM_DATA, DELETE } from "../request";
import * as methods from "../../utils/methods";

export async function getMusicByParams(payload) {
    const params = methods.convertQueryString(payload); // { pageIndex, pageSize, userId? }
    return GET(`/music?${params}`);
};

export async function getRecoByParams(payload) {
    const params = methods.convertQueryString(payload); // { pageIndex, pageSize, userId? }
    return GET(`/music/recommended?${params}`);
};

export async function getMusicById(payload) {
    return GET(`/music/${payload.id}`);
};

export async function createMusic(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return POST_FORM_DATA("/music", { formData });
};

export async function updateMusic(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return PUT_FORM_DATA(`/music/${payload.id}`, { formData });
};

export async function deleteMusic(payload) {
    return DELETE(`/music/${payload.id}`);
};