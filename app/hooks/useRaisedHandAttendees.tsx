// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import MessageType from '../types/MessageType';

export default function useRaisedHandAttendees() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [raisedHandAttendees, setRaisedHandAttendees] = useState(new Set());
  useEffect(() => {
    const realTimeRaisedHandAttendees = new Set();
    const callback = (message: MessageType) => {
      const { type, payload } = message;
      if (payload && payload.attendeeId) {
        if (type === 'raise-hand') {
          realTimeRaisedHandAttendees.add(payload.attendeeId);
        } else if (type === 'dismiss-hand') {
          realTimeRaisedHandAttendees.delete(payload.attendeeId);
        }
        setRaisedHandAttendees(new Set(realTimeRaisedHandAttendees));
      }
    };
    chime?.subscribeToMessageUpdate(callback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(callback);
    };
  }, []);
  return raisedHandAttendees;
}
