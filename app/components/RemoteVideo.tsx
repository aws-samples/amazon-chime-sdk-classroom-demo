// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React from 'react';
import { useIntl } from 'react-intl';

import ViewMode from '../enums/ViewMode';
import RosterAttendeeType from '../types/RosterAttendeeType';
import styles from './RemoteVideo.css';

const cx = classNames.bind(styles);

export enum Size {
  Small,
  Medium,
  Large
}

type Props = {
  viewMode: ViewMode;
  enabled: boolean;
  videoElementRef: (instance: HTMLVideoElement | null) => void;
  size: Size;
  rosterAttendee?: RosterAttendeeType;
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
    rosterAttendee = {},
    raisedHand,
    isContentShareEnabled
  } = props;
  const { name, muted } = rosterAttendee;
  return (
    <div
      className={cx('remoteVideo', {
        roomMode: viewMode === ViewMode.Room,
        screenShareMode: viewMode === ViewMode.ScreenShare,
        enabled,
        small: size === Size.Small,
        medium: size === Size.Medium,
        large: size === Size.Large,
        isContentShareEnabled
      })}
    >
      <video muted ref={videoElementRef} className={styles.video} />
      {name && typeof muted === 'boolean' && (
        <div className={cx('nameplate')}>
          {name && <div className={cx('name')}>{name}</div>}
          {typeof muted === 'boolean' && (
            <div className={cx('muted')}>
              {muted ? (
                <i className="fas fa-microphone-slash" />
              ) : (
                <i className="fas fa-microphone" />
              )}
            </div>
          )}
        </div>
      )}
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
