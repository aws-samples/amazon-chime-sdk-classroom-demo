// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import useRoster from '../hooks/useRoster';
import styles from './ScreenShareHeader.css';

const cx = classNames.bind(styles);

type Props = {
  onClickStopButton: () => void;
};

export default function ScreenShareHeader(props: Props) {
  const roster = useRoster();
  const { onClickStopButton } = props;
  return (
    <div className={cx('screenShareHeader')}>
      <button
        className={cx('stopButton')}
        type="button"
        onClick={onClickStopButton}
      >
        <FormattedMessage id="ScreenShareHeader.stopSharing" />
      </button>
      <div className={cx('description')}>
        {roster ? (
          <FormattedMessage
            id="ScreenShareHeader.online"
            values={{
              number: Object.keys(roster).length - 1
            }}
          />
        ) : (
          ` `
        )}
      </div>
    </div>
  );
}
