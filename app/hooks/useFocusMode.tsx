// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import MessageType from '../types/MessageType';

export default function useFocusMode() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [focusMode, setFocusMode] = useState(false);
  const [state] = useContext(getUIStateContext());
  useEffect(() => {
    const callback = (message: MessageType) => {
      if (state.classMode === ClassMode.Teacher) {
        return;
      }
      const { type, payload } = message;
      if (type === 'focus' && payload) {
        chime?.audioVideo?.realtimeSetCanUnmuteLocalAudio(!payload.focus);
        if (payload.focus === true) {
          chime?.audioVideo?.realtimeMuteLocalAudio();
        }
        setFocusMode(!!payload.focus);
      }
    };
    chime?.subscribeToMessageUpdate(callback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(callback);
    };
  }, []);
  return focusMode;
}
