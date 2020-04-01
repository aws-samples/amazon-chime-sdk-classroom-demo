// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

import enUS from '../i18n/en-US';

const DEFAULT_LOCALE = 'en-US';

const messages = {
  [DEFAULT_LOCALE]: enUS
};

type Props = {
  children: ReactNode;
};

export default function I18nProvider(props: Props) {
  const { children } = props;
  return (
    <IntlProvider
      locale={
        (navigator.languages && navigator.languages[0]) || navigator.language
      }
      defaultLocale={DEFAULT_LOCALE}
      messages={messages[DEFAULT_LOCALE]}
    >
      {children}
    </IntlProvider>
  );
}
