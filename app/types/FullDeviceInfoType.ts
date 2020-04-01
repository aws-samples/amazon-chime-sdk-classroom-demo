// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import DeviceType from './DeviceType';

type FullDeviceInfoType = {
  currentAudioInputDevice: DeviceType | null;
  currentAudioOutputDevice: DeviceType | null;
  currentVideoInputDevice: DeviceType | null;
  audioInputDevices: DeviceType[];
  audioOutputDevices: DeviceType[];
  videoInputDevices: DeviceType[];
};

export default FullDeviceInfoType;
