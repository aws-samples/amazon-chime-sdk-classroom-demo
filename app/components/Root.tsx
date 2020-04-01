// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { hot } from 'react-hot-loader/root';
import { HashRouter } from 'react-router-dom';

import ChimeProvider from '../providers/ChimeProvider';
import I18nProvider from '../providers/I18nProvider';
import UIStateProvider from '../providers/UIStateProvider';
import Routes from '../Routes';

const Root = () => (
  <HashRouter>
    <I18nProvider>
      <ChimeProvider>
        <UIStateProvider>
          <Routes />
        </UIStateProvider>
      </ChimeProvider>
    </I18nProvider>
  </HashRouter>
);

export default hot(Root);
