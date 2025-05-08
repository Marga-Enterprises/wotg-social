import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestForToken } from '../firebase';
import { wotgsocial } from '../redux/combineActions';

export const usePushSubscription = (user, isAuthenticated) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const subscribe = async () => {
      if (!("Notification" in window)) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      try {
        const fcmToken = await requestForToken();
        if (!fcmToken) return;

        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("deviceId", deviceId);
        }

        const userAgent = navigator.userAgent.toLowerCase();
        const deviceType = /android/.test(userAgent)
          ? 'android'
          : /iphone|ipad|ipod/.test(userAgent)
          ? 'ios'
          : 'web';

        const subscriptionData = {
          userId: user.id,
          deviceId,
          deviceType,
          subscription: { fcmToken },
        };

        const res = await dispatch(wotgsocial.subscription.addSubscriptionAction(subscriptionData));
        if (res.error && res.error.status === 400) {
          console.log("Subscription already exists.");
        } else {
          console.log("Push subscription successful");
        }
      } catch (err) {
        console.error("Push subscription failed", err);
      }
    };

    subscribe();
  }, [user, isAuthenticated, dispatch]);
};
