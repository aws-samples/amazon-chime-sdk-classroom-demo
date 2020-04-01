// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React, { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import localStorageKeys from '../constants/localStorageKeys.json';
import routes from '../constants/routes.json';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import styles from './Login.css';

const cx = classNames.bind(styles);

export default function Login() {
  const [, dispatch] = useContext(getUIStateContext());
  const history = useHistory();

  useEffect(() => {
    localStorage.clear();
    dispatch({
      type: 'SET_CLASS_MODE',
      payload: {
        classMode: null
      }
    });
  }, []);

  return (
    <div className={cx('login')}>
      <div className={cx('content')}>
        <h1 className={cx('title')}>
          <FormattedMessage id="Login.title" />
        </h1>
        <div className={cx('selection')}>
          <div className={cx('teacher')}>
            <h2>
              <FormattedMessage id="Login.teacherTitle" />
            </h2>
            <ul>
              <li>
                <FormattedMessage id="Login.teacherDescription1" />
              </li>
              <li>
                <FormattedMessage id="Login.teacherDescription2" />
              </li>
              <li>
                <FormattedMessage id="Login.teacherDescription3" />
              </li>
              <li>
                <FormattedMessage id="Login.teacherDescription4" />
              </li>
              <ul>
                <li>
                  <FormattedMessage id="Login.teacherToggleDescription1" />
                </li>
                <li>
                  <FormattedMessage id="Login.teacherToggleDescription2" />
                </li>
              </ul>
            </ul>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(
                  localStorageKeys.CLASS_MODE,
                  ClassMode.Teacher
                );
                dispatch({
                  type: 'SET_CLASS_MODE',
                  payload: {
                    classMode: ClassMode.Teacher
                  }
                });
                history.push(routes.CREATE_OR_JOIN);
              }}
            >
              <FormattedMessage id="Login.teacherButton" />
            </button>
          </div>
          <div className={cx('student')}>
            <h2>
              <FormattedMessage id="Login.studentTitle" />
            </h2>
            <ul>
              <li>
                <FormattedMessage id="Login.studentDescription1" />
              </li>
              <li>
                <FormattedMessage id="Login.studentDescription2" />
              </li>
              <li>
                <FormattedMessage id="Login.studentDescription3" />
              </li>
              <li>
                <FormattedMessage id="Login.studentDescription4" />
              </li>
              <ul>
                <li>
                  <FormattedMessage id="Login.studentToggleDescription1" />
                </li>
                <li>
                  <FormattedMessage id="Login.studentToggleDescription2" />
                </li>
              </ul>
            </ul>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(
                  localStorageKeys.CLASS_MODE,
                  ClassMode.Student
                );
                dispatch({
                  type: 'SET_CLASS_MODE',
                  payload: {
                    classMode: ClassMode.Student
                  }
                });
                history.push(routes.CREATE_OR_JOIN);
              }}
            >
              <FormattedMessage id="Login.studentButton" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
