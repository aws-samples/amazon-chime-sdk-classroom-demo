// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';

type Props = {
  children: ReactNode;
};

export default function ChimeProvider(props: Props) {
  const { children } = props;
  const chimeSdkWrapper = new ChimeSdkWrapper();
  const ChimeContext = getChimeContext();
  return (
    <ChimeContext.Provider value={chimeSdkWrapper}>
      {children}
    </ChimeContext.Provider>
  );
}
