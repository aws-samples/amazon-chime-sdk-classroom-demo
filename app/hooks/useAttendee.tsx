// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import RosterType from '../types/RosterType';
import RosterAttendeeType from '../types/RosterAttendeeType';

export default function useAttendee(attendeeId: string) {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [attendee, setAttendee] = useState<RosterAttendeeType>(
    chime?.roster[attendeeId] || {}
  );
  useEffect(() => {
    let previousRosterAttendee: RosterAttendeeType | null = null;
    const callback = (newRoster: RosterType) => {
      const rosterAttendee = newRoster[attendeeId]
        ? ({ ...newRoster[attendeeId] } as RosterAttendeeType)
        : null;

      // In the classroom demo, we don't subscribe to volume and signal strength changes.
      // The VideoNameplate component that uses this hook will re-render only when name and muted status change.
      if (rosterAttendee) {
        if (
          !previousRosterAttendee ||
          previousRosterAttendee.name !== rosterAttendee.name ||
          previousRosterAttendee.muted !== rosterAttendee.muted
        ) {
          setAttendee(rosterAttendee);
        }
      }
      previousRosterAttendee = rosterAttendee;
    };
    chime?.subscribeToRosterUpdate(callback);
    return () => {
      chime?.unsubscribeFromRosterUpdate(callback);
    };
  }, []);
  return attendee;
}
