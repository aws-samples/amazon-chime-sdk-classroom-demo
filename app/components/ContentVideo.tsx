// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DefaultModality, VideoTileState } from 'amazon-chime-sdk-js';
import classNames from 'classnames/bind';
import React, { useContext, useEffect, useRef, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import styles from './ContentVideo.css';

const cx = classNames.bind(styles);

type Props = {
  onContentShareEnabled: (enabled: boolean) => void;
};

export default function ContentVideo(props: Props) {
  const { onContentShareEnabled } = props;
  const [enabled, setEnabled] = useState(false);
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const videoElement = useRef(null);

  // Note that this useEffect takes no dependency (an empty array [] as a second argument).
  // Thus, calling props.onContentShareEnabled in the passed functon will point to an old prop
  // even if a parent component passes a new prop. See comments for the second useEffect.
  useEffect(() => {
    const contentTileIds = new Set();
    chime?.audioVideo?.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (
          !tileState.boundAttendeeId ||
          !tileState.isContent ||
          !tileState.tileId
        ) {
          return;
        }

        const modality = new DefaultModality(tileState.boundAttendeeId);
        if (
          modality.base() ===
            chime?.meetingSession?.configuration.credentials?.attendeeId &&
          modality.hasModality(DefaultModality.MODALITY_CONTENT)
        ) {
          return;
        }

        chime?.audioVideo?.bindVideoElement(
          tileState.tileId,
          (videoElement.current as unknown) as HTMLVideoElement
        );

        if (tileState.active) {
          contentTileIds.add(tileState.tileId);
          setEnabled(true);
        } else {
          contentTileIds.delete(tileState.tileId);
          setEnabled(contentTileIds.size > 0);
        }
      },
      videoTileWasRemoved: (tileId: number): void => {
        if (contentTileIds.has(tileId)) {
          contentTileIds.delete(tileId);
          setEnabled(contentTileIds.size > 0);
        }
      }
    });
  }, []);

  // Call props.onContentShareEnabled in this useEffect. Also, this useEffect does not depend on
  // props.onContentShareEnabled to avoid an unnecessary execution. Whenever the function
  // is invoked per enabled change, it will reference the latest onContentShareEnabled.
  useEffect(() => {
    onContentShareEnabled(enabled);
  }, [enabled]);

  return (
    <div className={cx('contentVideo')}>
      <video muted ref={videoElement} className={cx('video')} />
    </div>
  );
}
