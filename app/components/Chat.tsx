// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { DataMessage } from 'amazon-chime-sdk-js';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import styles from './Chat.css';
import ChatInput from './ChatInput';
import MessageTopic from '../enums/MessageTopic';

const cx = classNames.bind(styles);

export default function Chat() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [messages, setMessages] = useState<DataMessage[]>([]);
  const bottomElement = useRef(null);

  useEffect(() => {
    const realTimeMessages: DataMessage[] = [];
    const callback = (message: DataMessage) => {
      realTimeMessages.push(message);
      setMessages(realTimeMessages.slice() as DataMessage[]);
    };

    const chatMessageUpdateCallback = { topic: MessageTopic.Chat, callback };
    const raiseHandMessageUpdateCallback = {
      topic: MessageTopic.RaiseHand,
      callback
    };

    chime?.subscribeToMessageUpdate(chatMessageUpdateCallback);
    chime?.subscribeToMessageUpdate(raiseHandMessageUpdateCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(chatMessageUpdateCallback);
      chime?.unsubscribeFromMessageUpdate(raiseHandMessageUpdateCallback);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      ((bottomElement.current as unknown) as HTMLDivElement).scrollIntoView({
        behavior: 'smooth'
      });
    }, 10);
  }, [messages]);

  return (
    <div className={cx('chat')}>
      <div className={cx('messages')}>
        {messages.map(message => {
          let messageString;
          if (message.topic === MessageTopic.Chat) {
            messageString = message.text();
          } else if (message.topic === MessageTopic.RaiseHand) {
            messageString = `✋`;
          }

          return (
            <div
              key={message.timestampMs}
              className={cx('messageWrapper', {
                raiseHand: message.topic === MessageTopic.RaiseHand
              })}
            >
              <div className={cx('senderWrapper')}>
                <div className={cx('senderName')}>
                  {chime?.roster[message.senderAttendeeId].name}
                </div>
                <div className={cx('date')}>
                  {moment(message.timestampMs).format('h:mm A')}
                </div>
              </div>
              <div className={cx('message')}>{messageString}</div>
            </div>
          );
        })}
        <div className="bottom" ref={bottomElement} />
      </div>
      <div className={cx('chatInput')}>
        <ChatInput />
      </div>
    </div>
  );
}
