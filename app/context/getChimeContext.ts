// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';

const context = React.createContext<ChimeSdkWrapper | null>(null);

export default function getChimeContext() {
  return context;
}
