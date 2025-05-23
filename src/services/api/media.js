import { POST } from '../request.js';

import * as methods from '../../utils/methods.js';

export async function getPresignedUrl (payload) {
    return POST('/media/get-presigned-url', payload);
}