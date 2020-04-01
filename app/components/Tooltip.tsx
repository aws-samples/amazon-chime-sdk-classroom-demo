// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */
// Example code from react-popper-tooltip

import classNames from 'classnames/bind';
import React from 'react';
import RcTooltip from 'rc-tooltip';

import styles from './Tooltip.css';

const cx = classNames.bind(styles);

const Tooltip = ({ children, tooltip }: { children: React.ReactElement, tooltip: string }) => (
  <RcTooltip mouseLeaveDelay={0} overlayClassName={cx('tooltip')} placement="top" trigger={['hover']} overlay={<div>{tooltip}</div>}>
    {children}
  </RcTooltip>
);

export default Tooltip;
