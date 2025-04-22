import { GET, POST_FORM_DATA, PUT_FORM_DATA, DELETE } from "../request";
import * as methods from "../../utils/methods";

export async function getAlbumsByParams(payload) {
    const params = methods.convertQueryString(payload); // { pageIndex, pageSize, userId? }
    return GET(`/albums?${params}`);
};

export async function getAlbumById(payload) {
    return GET(`/albums/${payload.id}`);
};

export async function createAlbum(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return POST_FORM_DATA("/albums", { formData });
};

export async function updateAlbum(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return PUT_FORM_DATA(`/albums/${payload.id}`, { formData });
};

export async function deleteAlbum(payload) {
    return DELETE(`/albums/${payload.id}`);
}