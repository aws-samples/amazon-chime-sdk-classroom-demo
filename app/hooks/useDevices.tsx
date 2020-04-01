// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import FullDeviceInfoType from '../types/FullDeviceInfoType';

export default function useDevices() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [deviceSwitcherState, setDeviceUpdated] = useState({
    currentAudioInputDevice: chime?.currentAudioInputDevice,
    currentAudioOutputDevice: chime?.currentAudioOutputDevice,
    currentVideoInputDevice: chime?.currentVideoInputDevice,
    audioInputDevices: chime?.audioInputDevices,
    audioOutputDevices: chime?.audioOutputDevices,
    videoInputDevices: chime?.videoInputDevices
  });
  useEffect(() => {
    const devicesUpdatedCallback = (fullDeviceInfo: FullDeviceInfoType) => {
      setDeviceUpdated({
        ...fullDeviceInfo
      });
    };

    chime?.subscribeToDevicesUpdated(devicesUpdatedCallback);
    return () => {
      chime?.unsubscribeFromDevicesUpdated(devicesUpdatedCallback);
    };
  }, []);
  return deviceSwitcherState;
}
