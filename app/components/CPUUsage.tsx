// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { useIntl } from 'react-intl';

import styles from './CPUUsage.css';

const cx = classNames.bind(styles);

export default function CPUUsage() {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const [cpu, setCpu] = useState<number | null>(null);

  useEffect(() => {
    const getCpu = (): number | null => {
      try {
        return (
          Math.ceil(
            ((process.getCPUUsage().percentCPUUsage * 100) /
              navigator.hardwareConcurrency) *
              100
          ) / 100
        );
      } catch (error) {
        return null;
      }
    };

    let intervalId: number;
    ipcRenderer.on('chime-toggle-cpu-usage', (_, argument) => {
      clearInterval(intervalId);
      if (argument) {
        setVisible(true);
        setCpu(getCpu());
        intervalId = window.setInterval(() => {
          setCpu(getCpu());
        }, 2000);
      } else {
        setVisible(false);
        setCpu(null);
      }
    });

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  let text: string | number = '';
  if (cpu === null) {
    text = '';
  } else if (cpu === 0) {
    text = intl.formatMessage({ id: 'CPUUsage.getting' });
  } else if (cpu > 0) {
    text = `${cpu}%`;
  }

  return visible ? <div className={cx('CPUUsage')}>{text}</div> : <></>;
}
