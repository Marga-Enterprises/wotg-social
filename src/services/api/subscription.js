// utils
import * as methods from '../../utils/methods';

import { GET, POST, DELETE } from '../request';

// Save a new subscription
export async function saveSubscription(payload) {
  console.log('API PAYLOAD', payload);
  return POST('/subscriptions/subscribe', payload);
}

// Delete a subscription
export async function deleteSubscription(subscriptionId) {
  return DELETE(`/subscriptions/unsubscribe/${subscriptionId}`);
}
