// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type MessageType = {
  type: string;
  // eslint-disable-next-line
  payload?: any;
  timestampMs?: number;
  name?: string;
};

export default MessageType;
