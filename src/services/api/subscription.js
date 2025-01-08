// utils
import * as methods from '../../utils/methods';

import { GET, POST, DELETE } from '../request';

// Save a new subscription
export async function saveSubscription(payload) {
  return POST('/subscribe', payload);
}

// Delete a subscription
export async function deleteSubscription(subscriptionId) {
  return DELETE(`/unsubscribe/${subscriptionId}`);
}
