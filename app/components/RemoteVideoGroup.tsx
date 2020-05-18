// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { VideoTileState } from 'amazon-chime-sdk-js';
import classNames from 'classnames/bind';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import ViewMode from '../enums/ViewMode';
import Size from '../enums/Size';
import useRaisedHandAttendees from '../hooks/useRaisedHandAttendees';
import RemoteVideo from './RemoteVideo';
import styles from './RemoteVideoGroup.css';

const cx = classNames.bind(styles);
const MAX_REMOTE_VIDEOS = 16;

type Props = {
  viewMode: ViewMode;
  isContentShareEnabled: boolean;
};

export default function RemoteVideoGroup(props: Props) {
  const { viewMode, isContentShareEnabled } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [visibleIndices, setVisibleIndices] = useState<{
    [index: string]: { boundAttendeeId: string };
  }>({});
  const raisedHandAttendees = useRaisedHandAttendees();
  const videoElements: HTMLVideoElement[] = [];
  const tiles: { [index: number]: number } = {};

  const acquireVideoIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index += 1) {
      if (tiles[index] === tileId) {
        return index;
      }
    }
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index += 1) {
      if (!(index in tiles)) {
        tiles[index] = tileId;
        return index;
      }
    }
    throw new Error('no tiles are available');
  };

  const releaseVideoIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index += 1) {
      if (tiles[index] === tileId) {
        delete tiles[index];
        return index;
      }
    }
    return -1;
  };

  const numberOfVisibleIndices = Object.keys(visibleIndices).reduce<number>(
    (result: number, key: string) => result + (visibleIndices[key] ? 1 : 0),
    0
  );

  useEffect(() => {
    chime?.audioVideo?.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (
          !tileState.boundAttendeeId ||
          tileState.localTile ||
          tileState.isContent ||
          !tileState.tileId
        ) {
          return;
        }
        const index = acquireVideoIndex(tileState.tileId);
        chime?.audioVideo?.bindVideoElement(
          tileState.tileId,
          videoElements[index]
        );
        setVisibleIndices(previousVisibleIndices => ({
          ...previousVisibleIndices,
          [index]: {
            boundAttendeeId: tileState.boundAttendeeId
          }
        }));
      },
      videoTileWasRemoved: (tileId: number): void => {
        const index = releaseVideoIndex(tileId);
        setVisibleIndices(previousVisibleIndices => ({
          ...previousVisibleIndices,
          [index]: null
        }));
      }
    });
  }, []);

  const getSize = (): Size => {
    if (numberOfVisibleIndices >= 10) {
      return Size.Small;
    }
    if (numberOfVisibleIndices >= 5) {
      return Size.Medium;
    }
    return Size.Large;
  };

  return (
    <div
      className={cx(
        'remoteVideoGroup',
        `remoteVideoGroup-${numberOfVisibleIndices}`,
        {
          roomMode: viewMode === ViewMode.Room,
          screenShareMode: viewMode === ViewMode.ScreenShare,
          isContentShareEnabled
        }
      )}
    >
      {numberOfVisibleIndices === 0 && (
        <div className={cx('instruction')}>
          <FormattedMessage id="RemoteVideoGroup.noVideo" />
        </div>
      )}
      {Array.from(Array(MAX_REMOTE_VIDEOS).keys()).map((key, index) => {
        const visibleIndex = visibleIndices[index];
        const attendeeId = visibleIndex ? visibleIndex.boundAttendeeId : null;
        const raisedHand = raisedHandAttendees
          ? raisedHandAttendees.has(attendeeId)
          : false;
        return (
          <RemoteVideo
            key={key}
            viewMode={viewMode}
            enabled={!!visibleIndex}
            videoElementRef={useCallback((element: HTMLVideoElement | null) => {
              if (element) {
                videoElements[index] = element;
              }
            }, [])}
            size={getSize()}
            attendeeId={attendeeId}
            raisedHand={raisedHand}
            isContentShareEnabled={isContentShareEnabled}
          />
        );
      })}
    </div>
  );
}
