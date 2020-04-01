// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode, useContext, useEffect, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getRosterContext from '../context/getRosterContext';
import RosterType from '../types/RosterType';

type Props = {
  children: ReactNode;
};

export default function RosterProvider(props: Props) {
  const { children } = props;
  const [roster, setRoster] = useState<RosterType>({});
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const RosterContext = getRosterContext();

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

  return (
    <RosterContext.Provider value={roster}>{children}</RosterContext.Provider>
  );
}
