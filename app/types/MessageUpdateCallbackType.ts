// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DataMessage } from 'amazon-chime-sdk-js';

type MessageUpdateCallbackType = {
  topic: string;
  callback: (message: DataMessage) => void;
};

export default MessageUpdateCallbackType;
