import { GET, POST, POST_FORM_DATA, PUT_FORM_DATA, DELETE } from '../request.js';
import * as methods from '../../utils/methods.js';

export async function getPlaylistsByParams(payload) {
    const params = methods.convertQueryString(payload); // { pageIndex, pageSize, userId? }
    return GET(`/playlists?${params}`);
}

export async function getPlaylistById(payload) {
    return GET(`/playlists/${payload.id}`);
}

export async function createPlaylist(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return POST_FORM_DATA('/playlists', { formData });
}

export async function updatePlaylist(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return PUT_FORM_DATA(`/playlists/${payload.id}`, { formData });
}

export async function deletePlaylist(payload) {
    return DELETE(`/playlists/${payload.id}`);
}

export async function addMusicToPlaylist(payload) {
    return POST(`/playlists/${payload.playlistId}/add`, payload); // { musicId, playlistId }
}

export async function removeMusicFromPlaylist(payload) {
    return DELETE(`/playlists/${payload.playlistId}/remove`, payload); // { musicId, playlistId }
}

