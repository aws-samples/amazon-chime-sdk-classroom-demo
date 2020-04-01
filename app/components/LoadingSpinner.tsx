// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React from 'react';

import styles from './LoadingSpinner.css';

const cx = classNames.bind(styles);

export default function LoadingSpinner() {
  return (
    <div className={cx('loadingSpinner')}>
      <div className={cx('spinner')}>
        {Array.from(Array(12).keys()).map(key => (
          <div key={key} className={cx('circle', `circle${key + 1}`)} />
        ))}
      </div>
    </div>
  );
}
