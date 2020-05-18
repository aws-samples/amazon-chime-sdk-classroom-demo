// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode, useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import App from './components/App';
import Classroom from './components/Classroom';
import CreateOrJoin from './components/CreateOrJoin';
import Home from './components/Home';
import Login from './components/Login';
import routes from './constants/routes.json';
import getUIStateContext from './context/getUIStateContext';
import MeetingStatusProvider from './providers/MeetingStatusProvider';

export default function Routes() {
  const [state] = useContext(getUIStateContext());

  const PrivateRoute = ({
    children,
    path
  }: {
    children: ReactNode;
    path: string;
  }) => {
    return (
      <Route path={path}>
        {state.classMode ? children : <Redirect to={routes.LOGIN} />}
      </Route>
    );
  };

  return (
    <App>
      <Switch>
        <PrivateRoute path={routes.CLASSROOM}>
          <MeetingStatusProvider>
            <Classroom />
          </MeetingStatusProvider>
        </PrivateRoute>
        <PrivateRoute path={routes.CREATE_OR_JOIN}>
          <CreateOrJoin />
        </PrivateRoute>
        <Route path={routes.LOGIN}>
          <Login />
        </Route>
        <Route path={routes.HOME}>
          <Home />
        </Route>
      </Switch>
    </App>
  );
}
