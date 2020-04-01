// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import RosterType from '../types/RosterType';

const context = React.createContext<RosterType>({});

export default function getRosterContext() {
  return context;
}
