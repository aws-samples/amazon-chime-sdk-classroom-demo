// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import RosterAttendeeType from './RosterAttendeeType';

type RosterType = {
  [attendeeId: string]: RosterAttendeeType;
};

export default RosterType;
