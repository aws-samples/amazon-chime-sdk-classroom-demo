// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { VideoTileState } from 'amazon-chime-sdk-js';
import classNames from 'classnames/bind';
import React, { useContext, useEffect, useRef, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import styles from './LocalVideo.css';

const cx = classNames.bind(styles);

export default function LocalVideo() {
  const [enabled, setEnabled] = useState(false);
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const videoElement = useRef(null);

  useEffect(() => {
    chime?.audioVideo?.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (
          !tileState.boundAttendeeId ||
          !tileState.localTile ||
          !tileState.tileId ||
          !videoElement.current
        ) {
          return;
        }
        chime?.audioVideo?.bindVideoElement(
          tileState.tileId,
          (videoElement.current as unknown) as HTMLVideoElement
        );
        setEnabled(tileState.active);
      }
    });
  }, []);

  return (
    <div
      className={cx('localVideo', {
        enabled
      })}
    >
      <video muted ref={videoElement} className={cx('video')} />
    </div>
  );
}
