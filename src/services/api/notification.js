import { GET } from '../request.js';
import * as methods from '../../utils/methods.js';

export async function getNotificationsByParams(payload) {
    const params = methods.convertQueryString(payload);
    return GET(`/notifications?${params}`);
};