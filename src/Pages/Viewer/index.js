import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as mediasoupClient from 'mediasoup-client';
import { wotgsocial } from '../../redux/combineActions';
import styles from './index.module.css';

const Viewer = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('Checking for live stream...');
  const [isStreaming, setIsStreaming] = useState(false);
  const [device, setDevice] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);

  useEffect(() => {
    const checkLiveStream = async () => {
      try {
        setStatusMessage('Checking for live stream...');
        console.log('🔍 Checking live stream status...');

        const res = await dispatch(wotgsocial.stream.checkStreamStatusAction());

        if (res && res.isLive && res.rtpCapabilities) {
          console.log('✅ Live stream detected, initializing viewer...');
          await initializeDevice(res.rtpCapabilities);
          setIsStreaming(true);
        } else {
          console.warn('❌ No live stream detected');
          setStatusMessage('No Livestream');
        }
      } catch (error) {
        console.error('❌ Error checking live stream:', error);
        setStatusMessage('No Livestream');
      }
    };

    const initializeDevice = async (routerRtpCapabilities) => {
      try {
        console.log('🔄 Initializing Mediasoup Device...');
        const newDevice = new mediasoupClient.Device();
        await newDevice.load({ routerRtpCapabilities });
        setDevice(newDevice);
        console.log('✅ Mediasoup Device Initialized');
        await createConsumerTransport(newDevice);
      } catch (error) {
        console.error('❌ Error initializing device:', error);
        setStatusMessage('No Livestream');
      }
    };

    const createConsumerTransport = async (device) => {
      try {
        console.log('🔄 Requesting Consumer Transport...');
        const transportResponse = await dispatch(wotgsocial.stream.createTransportAction({ role: 'consumer' }));

        if (!transportResponse || !transportResponse.id) {
          console.error('❌ Failed to create transport', transportResponse);
          setStatusMessage('No Livestream');
          return;
        }

        console.log('✅ Consumer Transport Created:', transportResponse);

        const transport = device.createRecvTransport(transportResponse);
        setConsumerTransport(transport);

        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            console.log('🔄 Connecting Consumer Transport...');
            await dispatch(wotgsocial.stream.connectTransportAction({
              dtlsParameters,
              role: 'consumer',
            }));
            console.log('✅ Consumer Transport Connected');
            callback();
            await consumeStream(device, transport);
          } catch (error) {
            console.error('❌ Error connecting transport:', error);
            errback(error);
          }
        });
      } catch (error) {
        console.error('❌ Error creating consumer transport:', error);
        setStatusMessage('No Livestream');
      }
    };

    const consumeStream = async (device, transport) => {
      try {
        console.log('🔄 Requesting to consume stream...');
        const consumeResponse = await dispatch(wotgsocial.stream.consumeStreamAction({
          rtpCapabilities: device.rtpCapabilities,
        }));

        if (!consumeResponse || !consumeResponse.id) {
          console.error('❌ Failed to consume stream', consumeResponse);
          setStatusMessage('No Livestream');
          return;
        }

        console.log('✅ Stream Consumption Response:', consumeResponse);

        // **🎥 Create Consumer**
        const consumer = await transport.consume({
          id: consumeResponse.id,
          producerId: consumeResponse.producerId,
          kind: consumeResponse.kind,
          rtpParameters: consumeResponse.rtpParameters,
          paused: false, // Start consuming immediately
        });

        console.log(`🎥 Consumer Created: ${consumer.id} | Kind: ${consumer.kind}`);

        const stream = new MediaStream();
        stream.addTrack(consumer.track); // ✅ FIXED: Now using `consumer.track` correctly

        console.log('🎥 MediaStream Created:', stream);

        videoRef.current.srcObject = stream;
        videoRef.current.play()
          .then(() => console.log('✅ Video Playback Started'))
          .catch(error => console.error('❌ Video Play Error:', error));

        setStatusMessage('🟢 Live Stream Started!');
      } catch (error) {
        console.error('❌ Error consuming stream:', error);
        setStatusMessage('No Livestream');
      }
    };

    checkLiveStream();
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📺 Live Viewer</h1>

      <div className={`${styles.status} ${isStreaming ? styles.active : styles.inactive}`}>
        {statusMessage}
      </div>

      {isStreaming ? (
        <video ref={videoRef} autoPlay playsInline className={styles.video} />
      ) : (
        <div className={styles.noStream}>No Livestream</div>
      )}
    </div>
  );
};

export default Viewer;
