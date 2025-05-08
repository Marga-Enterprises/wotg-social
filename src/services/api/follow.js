import { GET, POST, DELETE } from '../request.js';
import * as methods from '../../utils/methods.js';

// GET FOLLOWERS BY PARAMS BY USER ID
export async function getFollowersByParams(payload) {
    const params = methods.convertQueryString(payload); // { pageIndex, pageSize, userId? }
    return GET(`/follow/followers/${payload.userId}?${params}`);
};

// GET FOLLOWING BY PARAMS BY USER ID
export async function getFollowingByParams(payload) {
    const params = methods.convertQueryString(payload); // { pageIndex, pageSize, userId? }
    return GET(`/follow/following/${payload.userId}?${params}`);
};

// FOLLOW A USER BY ID
export async function followUserById(payload) {
    return POST(`/follow/follow-user/${payload.userId}`, { payload });
};

// UNFOLLOW A USER BY ID
export async function unfollowUserById(payload) {
    return DELETE(`/follow/unfollow-user/${payload.userId}`, { payload });
};

