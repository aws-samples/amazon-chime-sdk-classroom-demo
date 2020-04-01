// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode, useReducer } from 'react';

import getUIStateContext, {
  initialState,
  SetClassModeActon,
  StateType
} from '../context/getUIStateContext';

const reducer = (state: StateType, action: SetClassModeActon): StateType => {
  switch (action.type) {
    case 'SET_CLASS_MODE':
      return {
        ...state,
        classMode: action.payload.classMode
      };
    default:
      throw new Error();
  }
};

type Props = {
  children: ReactNode;
};

export default function UIStateProvider(props: Props) {
  const { children } = props;
  const UIStateContext = getUIStateContext();
  return (
    <UIStateContext.Provider value={useReducer(reducer, initialState)}>
      {children}
    </UIStateContext.Provider>
  );
}
