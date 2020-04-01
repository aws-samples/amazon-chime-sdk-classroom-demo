// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import { desktopCapturer, DesktopCapturerSource } from 'electron';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import LoadingSpinner from './LoadingSpinner';
import styles from './ScreenPicker.css';

const cx = classNames.bind(styles);

enum ShareType {
  Screen,
  Window
}

type Props = {
  onClickShareButton: (selectedSourceId: string) => void;
  onClickCancelButton: () => void;
};

export default function ScreenPicker(props: Props) {
  const { onClickCancelButton, onClickShareButton } = props;
  const [sources, setSources] = useState<DesktopCapturerSource[] | null>(null);
  const [shareType, setShareType] = useState(ShareType.Window);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  useEffect(() => {
    desktopCapturer
      .getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 600, height: 600 }
      })
      .then(async (desktopCapturerSources: DesktopCapturerSource[]) => {
        setSources(desktopCapturerSources);
        return null;
      })
      .catch(error => {
        // eslint-disable-next-line
        console.error(error);
      });
  }, []);

  const { screenSources, windowSources } = (
    sources || ([] as DesktopCapturerSource[])
  ).reduce(
    (
      result: {
        screenSources: DesktopCapturerSource[];
        windowSources: DesktopCapturerSource[];
      },
      source: DesktopCapturerSource
    ) => {
      if (source.name === document.title) {
        return result;
      }

      if (source.id.startsWith('screen')) {
        result.screenSources.push(source);
      } else {
        result.windowSources.push(source);
      }
      return result;
    },
    {
      screenSources: [] as DesktopCapturerSource[],
      windowSources: [] as DesktopCapturerSource[]
    }
  );

  const selectedSources =
    shareType === ShareType.Screen ? screenSources : windowSources;

  return (
    <div className={cx('screenPicker')}>
      <div className={cx('top')}>
        <h1 className={cx('header')}>
          <FormattedMessage id="ScreenPicker.title" />
        </h1>
        <div className={cx('tabs')}>
          <button
            type="button"
            className={cx('windowTab', {
              selected: shareType === ShareType.Window
            })}
            onClick={() => {
              setShareType(ShareType.Window);
            }}
          >
            <FormattedMessage id="ScreenPicker.applicationWindowTab" />
          </button>
          <button
            type="button"
            className={cx('screenTab', {
              selected: shareType === ShareType.Screen
            })}
            onClick={() => {
              setShareType(ShareType.Screen);
            }}
          >
            <FormattedMessage id="ScreenPicker.yourEntireScreenTab" />
          </button>
        </div>
      </div>
      <div
        className={cx('middle', {
          loading: !sources
        })}
      >
        {!sources && <LoadingSpinner />}
        {sources && selectedSources && !selectedSources.length && (
          <div className={cx('noScreen')}>
            <FormattedMessage id="ScreenPicker.noScreen" />
          </div>
        )}
        {sources &&
          selectedSources &&
          selectedSources.map(source => (
            <div
              key={source.id}
              className={cx('source', {
                selected: source.id === selectedSourceId
              })}
              onClick={() => {
                setSelectedSourceId(source.id);
              }}
              onKeyPress={() => {}}
              role="button"
              tabIndex={0}
            >
              <div className={cx('image')}>
                <img src={source.thumbnail.toDataURL()} alt={source.name} />
              </div>
              <div className={cx('caption')}>{source.name}</div>
            </div>
          ))}
      </div>
      <div className={cx('bottom')}>
        <div className={cx('buttons')}>
          <button
            type="button"
            className={cx('cancelButton')}
            onClick={() => {
              onClickCancelButton();
            }}
          >
            <FormattedMessage id="ScreenPicker.cancel" />
          </button>
          <button
            type="button"
            disabled={!selectedSourceId}
            className={cx('shareButton', {
              enabled: !!selectedSourceId
            })}
            onClick={() => {
              if (selectedSourceId) {
                onClickShareButton(selectedSourceId);
              }
            }}
          >
            <FormattedMessage id="ScreenPicker.share" />
          </button>
        </div>
      </div>
    </div>
  );
}
