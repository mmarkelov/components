// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import { useAppLayoutInternals } from './context';
import styles from './styles.css.js';
import testutilStyles from '../test-classes/styles.css.js';

/**
 * The CSS class 'awsui-context-content-header' needs to be added to the root element so
 * that the design tokens used are overridden with the appropriate values.
 */
export default function Notifications() {
  const {
    ariaLabels,
    hasNotificationsContent,
    notifications,
    notificationsElement,
    stickyNotifications,
    isMobile,
    isAnyPanelOpen,
  } = useAppLayoutInternals();

  if (!notifications) {
    return null;
  }

  /*
  The notificationsElement ref is assigned to an inner div to prevent internal bottom margin from affecting the
  calculated height, which is used for sticky elements below.
   */

  return (
    <div
      role="region"
      aria-label={ariaLabels?.notifications ?? undefined}
      className={clsx(
        styles.notifications,
        {
          [styles['has-notifications-content']]: hasNotificationsContent,
          [styles['sticky-notifications']]: stickyNotifications,
          [styles.unfocusable]: isMobile && isAnyPanelOpen,
        },
        testutilStyles.notifications,
        'awsui-context-content-header'
      )}
    >
      <div ref={notificationsElement}>{notifications}</div>
    </div>
  );
}
