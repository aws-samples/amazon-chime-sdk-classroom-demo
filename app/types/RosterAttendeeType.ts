// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type RosterAttendeeType = {
  name?: string;
  active?: boolean;
  muted?: boolean;
  signalStrength?: number;
  volume?: number;
  isContent?: boolean;
};

export default RosterAttendeeType;
