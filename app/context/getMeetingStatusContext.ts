// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import MeetingStatus from '../enums/MeetingStatus';

const context = React.createContext<{
  meetingStatus: MeetingStatus;
  errorMessage?: string;
}>({
  meetingStatus: MeetingStatus.Loading
});

export default function getMeetingStatusContext() {
  return context;
}
