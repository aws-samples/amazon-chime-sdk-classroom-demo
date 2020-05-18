// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import RosterType from '../types/RosterType';

export default function useRoster() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [roster, setRoster] = useState<RosterType>(chime?.roster || {});
  useEffect(() => {
    const callback = (newRoster: RosterType) => {
      setRoster({
        ...newRoster
      } as RosterType);
    };
    chime?.subscribeToRosterUpdate(callback);
    return () => {
      chime?.unsubscribeFromRosterUpdate(callback);
    };
  }, []);
  return roster;
}
