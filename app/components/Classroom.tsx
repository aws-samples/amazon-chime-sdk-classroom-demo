// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import { ipcRenderer, remote } from 'electron';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-modal';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getMeetingStatusContext from '../context/getMeetingStatusContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import MeetingStatus from '../enums/MeetingStatus';
import ViewMode from '../enums/ViewMode';
import Chat from './Chat';
import styles from './Classroom.css';
import ContentVideo from './ContentVideo';
import Controls from './Controls';
import DeviceSwitcher from './DeviceSwitcher';
import Error from './Error';
import LoadingSpinner from './LoadingSpinner';
import LocalVideo from './LocalVideo';
import RemoteVideoGroup from './RemoteVideoGroup';
import Roster from './Roster';
import ScreenPicker from './ScreenPicker';
import ScreenShareHeader from './ScreenShareHeader';

const cx = classNames.bind(styles);

export default function Classroom() {
  Modal.setAppElement('body');
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [state] = useContext(getUIStateContext());
  const { meetingStatus, errorMessage } = useContext(getMeetingStatusContext());
  const [isContentShareEnabled, setIsContentShareEnabled] = useState(false);
  const [viewMode, setViewMode] = useState(ViewMode.Room);
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);
  const [isPickerEnabled, setIsPickerEnabled] = useState(false);

  const stopContentShare = async () => {
    setIsModeTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    ipcRenderer.on('chime-disable-screen-share-mode-ack', () => {
      try {
        chime?.audioVideo?.stopContentShare();
      } catch (error) {
        // eslint-disable-next-line
        console.error(error);
      } finally {
        setViewMode(ViewMode.Room);
        setIsModeTransitioning(false);
      }
    });
    ipcRenderer.send('chime-disable-screen-share-mode');
  };

  // Must pass a memoized callback to the ContentVideo component using useCallback().
  // ContentVideo will re-render only when one dependency "viewMode" changes.
  // See more comments in ContentVideo.
  const onContentShareEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && viewMode === ViewMode.ScreenShare) {
        await stopContentShare();
      }
      setIsContentShareEnabled(enabled);
    },
    [viewMode]
  );

  if (process.env.NODE_ENV === 'production') {
    useEffect(() => {
      // Recommend using "onbeforeunload" over "addEventListener"
      window.onbeforeunload = async (event: BeforeUnloadEvent) => {
        // Prevent the window from closing immediately
        // eslint-disable-next-line
        event.returnValue = true;
        try {
          await chime?.leaveRoom(state.classMode === ClassMode.Teacher);
        } catch (error) {
          // eslint-disable-next-line
          console.error(error);
        } finally {
          window.onbeforeunload = null;
          remote.app.quit();
        }
      };
      return () => {
        window.onbeforeunload = null;
      };
    }, []);
  }

  return (
    <div
      className={cx('classroom', {
        roomMode: viewMode === ViewMode.Room,
        screenShareMode: viewMode === ViewMode.ScreenShare,
        isModeTransitioning,
        isContentShareEnabled
      })}
    >
      {meetingStatus === MeetingStatus.Loading && <LoadingSpinner />}
      {meetingStatus === MeetingStatus.Failed && (
        <Error errorMessage={errorMessage} />
      )}
      {meetingStatus === MeetingStatus.Succeeded && (
        <>
          <>
            <div className={cx('left')}>
              {viewMode === ViewMode.ScreenShare && (
                <ScreenShareHeader onClickStopButton={stopContentShare} />
              )}
              <div className={cx('contentVideoWrapper')}>
                <ContentVideo onContentShareEnabled={onContentShareEnabled} />
              </div>
              <div className={cx('remoteVideoGroupWrapper')}>
                <RemoteVideoGroup
                  viewMode={viewMode}
                  isContentShareEnabled={isContentShareEnabled}
                />
              </div>
              <div className={cx('localVideoWrapper')}>
                <div className={cx('controls')}>
                  <Controls
                    viewMode={viewMode}
                    onClickShareButton={() => {
                      setIsPickerEnabled(true);
                    }}
                  />
                </div>
                <div className={cx('localVideo')}>
                  <LocalVideo />
                </div>
              </div>
            </div>
            <div className={cx('right')}>
              <div className={cx('titleWrapper')}>
                <div className={cx('title')}>{chime?.title}</div>
                <div className={cx('label')}>
                  <FormattedMessage id="Classroom.classroom" />
                </div>
              </div>
              <div className={cx('deviceSwitcher')}>
                <DeviceSwitcher />
              </div>
              <div className={cx('roster')}>
                <Roster />
              </div>
              <div className={cx('chat')}>
                <Chat />
              </div>
            </div>
          </>
          <Modal
            isOpen={isPickerEnabled}
            contentLabel="Screen picker"
            className={cx('modal')}
            overlayClassName={cx('modalOverlay')}
            onRequestClose={() => {
              setIsPickerEnabled(false);
            }}
          >
            <ScreenPicker
              onClickShareButton={async (selectedSourceId: string) => {
                setIsModeTransitioning(true);
                await new Promise(resolve => setTimeout(resolve, 200));
                ipcRenderer.on(
                  'chime-enable-screen-share-mode-ack',
                  async () => {
                    try {
                      setIsPickerEnabled(false);
                      await chime?.audioVideo?.startContentShareFromScreenCapture(
                        selectedSourceId
                      );
                      setViewMode(ViewMode.ScreenShare);
                      setIsModeTransitioning(false);
                    } catch (error) {
                      // eslint-disable-next-line
                      console.error(error);
                      await stopContentShare();
                    }
                  }
                );
                ipcRenderer.send('chime-enable-screen-share-mode');
              }}
              onClickCancelButton={() => {
                setIsPickerEnabled(false);
              }}
            />
          </Modal>
        </>
      )}
    </div>
  );
}
