// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React from 'react';
import { useIntl } from 'react-intl';

import ViewMode from '../enums/ViewMode';
import Size from '../enums/Size';
import VideoNameplate from './VideoNameplate';
import styles from './RemoteVideo.css';

const cx = classNames.bind(styles);

type Props = {
  viewMode: ViewMode;
  enabled: boolean;
  videoElementRef: (instance: HTMLVideoElement | null) => void;
  size: Size;
  attendeeId: string | null;
  raisedHand?: boolean;
  isContentShareEnabled: boolean;
};

export default function RemoteVideo(props: Props) {
  const intl = useIntl();
  const {
    viewMode,
    enabled,
    videoElementRef,
    size = Size.Large,
    attendeeId,
    raisedHand,
    isContentShareEnabled
  } = props;
  return (
    <div
      className={cx('remoteVideo', {
        roomMode: viewMode === ViewMode.Room,
        screenShareMode: viewMode === ViewMode.ScreenShare,
        enabled
      })}
    >
      <video muted ref={videoElementRef} className={styles.video} />
      <VideoNameplate
        viewMode={viewMode}
        size={size}
        isContentShareEnabled={isContentShareEnabled}
        attendeeId={attendeeId}
      />
      {raisedHand && (
        <div className={cx('raisedHand')}>
          <span
            role="img"
            aria-label={intl.formatMessage({
              id: 'RemoteVideo.raiseHandAriaLabel'
            })}
          >
            ✋
          </span>
        </div>
      )}
    </div>
  );
}
