// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React, { useContext, useEffect, useState } from 'react';
import Dropdown, { Option } from 'react-dropdown';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import routes from '../constants/routes.json';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import RegionType from '../types/RegionType';
import styles from './CreateOrJoin.css';
import OptionalFeature from '../enums/OptionalFeature';

const cx = classNames.bind(styles);

const optionalFeatures = [
  { label: 'None', value: OptionalFeature.None },
  { label: 'Enable Simulcast For Chrome', value: OptionalFeature.Simulcast }
];

export default function CreateOrJoin() {
  const chime = useContext(getChimeContext()) as ChimeSdkWrapper;
  const [state] = useContext(getUIStateContext());
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState<RegionType | undefined>(undefined);
  const [optionalFeature, setOptionalFeature] = useState('');
  const history = useHistory();
  const intl = useIntl();

  useEffect(() => {
    setOptionalFeature(optionalFeatures[0].value);
    (async () => {
      setRegion(await chime?.lookupClosestChimeRegion());
    })();
  }, []);

  return (
    <div className={cx('createOrJoin')}>
      <div className={cx('formWrapper')}>
        <h1 className={cx('title')}>
          {state.classMode === ClassMode.Teacher ? (
            <FormattedMessage id="CreateOrJoin.teacherTitle" />
          ) : (
            <FormattedMessage id="CreateOrJoin.studentTitle" />
          )}
        </h1>
        <form
          className={cx('form')}
          onSubmit={event => {
            event.preventDefault();
            if (title && name && region) {
              history.push(
                `/classroom?title=${encodeURIComponent(
                  title
                )}&name=${encodeURIComponent(name)}&region=${
                  region.value
                }&optionalFeature=${optionalFeature}`
              );
            }
          }}
        >
          <input
            className={cx('titleInput')}
            onChange={event => {
              setTitle(event.target.value);
            }}
            placeholder={intl.formatMessage({
              id: 'CreateOrJoin.titlePlaceholder'
            })}
          />
          <input
            className={cx('nameInput')}
            onChange={event => {
              setName(event.target.value);
            }}
            placeholder={intl.formatMessage({
              id: 'CreateOrJoin.namePlaceholder'
            })}
          />
          {state.classMode === ClassMode.Teacher && (
            <div className={cx('regionsList')}>
              <Dropdown
                className={cx('dropdown')}
                controlClassName={cx('control')}
                placeholderClassName={cx('placeholder')}
                menuClassName={cx('menu')}
                arrowClassName={cx('arrow')}
                value={region}
                options={
                  region ? chime?.supportedChimeRegions : ([] as RegionType[])
                }
                disabled={!region}
                onChange={(selectedRegion: RegionType) => {
                  setRegion(selectedRegion);
                }}
                placeholder=""
              />
            </div>
          )}

          <div className={cx('regionsList')}>
            <Dropdown
              className={cx('dropdown')}
              controlClassName={cx('control')}
              placeholderClassName={cx('placeholder')}
              menuClassName={cx('menu')}
              arrowClassName={cx('arrow')}
              value={optionalFeature}
              options={optionalFeatures}
              onChange={(selectedFeature: Option) => {
                setOptionalFeature(selectedFeature.value);
              }}
              placeholder={optionalFeatures[0].label}
            />
          </div>

          <button className={cx('button')} type="submit">
            <FormattedMessage id="CreateOrJoin.continueButton" />
          </button>
        </form>
        <Link className={cx('loginLink')} to={routes.LOGIN}>
          {state.classMode === ClassMode.Teacher ? (
            <FormattedMessage id="CreateOrJoin.notTeacherLink" />
          ) : (
            <FormattedMessage id="CreateOrJoin.notStudentLink" />
          )}
        </Link>
      </div>
    </div>
  );
}
