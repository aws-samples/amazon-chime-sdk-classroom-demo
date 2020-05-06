// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode } from 'react';
import CPUUsage from './CPUUsage';

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  return (
    <>
      {children}
      <CPUUsage />
    </>
  );
}
