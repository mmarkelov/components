// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { range } from 'lodash';
import { TokenGroupProps } from '~components/token-group';
import { Token } from '~components/token-group/token';
import TokenList from '~components/internal/components/token-list';
import Box from '~components/box';
import SpaceBetween from '~components/space-between';
import Icon from '~components/icon';
import styles from './styles.scss';

const i18nStrings: TokenGroupProps.I18nStrings = {
  limitShowMore: 'Show more chosen options',
  limitShowFewer: 'Show fewer chosen options',
};

export default function GenericTokenGroupPage() {
  const [files, setFiles] = useState(range(0, 4));

  const onDismiss = (itemIndex: number) => {
    const newItems = [...files];
    newItems.splice(itemIndex, 1);
    setFiles(newItems);
  };

  return (
    <Box padding="xl">
      <h1>Generic token group</h1>
      <SpaceBetween size="l" direction="vertical">
        <div role="group" aria-label="Custom token">
          <Token>Custom token</Token>
        </div>

        <div role="group" aria-label="Custom token" aria-disabled={true}>
          <Token disabled={true}>Custom disabled token</Token>
        </div>

        <TokenList
          alignment="vertical"
          items={files}
          i18nStrings={i18nStrings}
          limit={5}
          renderItem={(file, fileIndex) => (
            <Token
              disabled={file === 0}
              dismissLabel={`Remove file ${fileIndex + 1}`}
              onDismiss={() => onDismiss(fileIndex)}
            >
              <FileOption file={file} />
            </Token>
          )}
          itemAttributes={file => ({ 'aria-label': `agreement-${file + 1}.pdf`, 'aria-disabled': file === 0 })}
        />
      </SpaceBetween>
    </Box>
  );
}

function FileOption({ file }: { file: number }) {
  const fileName = `agreement-${file + 1}.pdf`;
  return (
    <Box className={styles['file-option']}>
      <Icon variant="success" name="status-positive" />

      <div className={styles['file-option-metadata']}>
        <SpaceBetween direction="vertical" size="xxxs">
          {
            <div className={styles['file-option-name']}>
              <div className={styles['file-option-name-label']} title={fileName}>
                {fileName}
              </div>
            </div>
          }
          <Box fontSize="body-s" color="text-body-secondary">
            application/pdf
          </Box>
          <Box fontSize="body-s" color="text-body-secondary">
            313.03 KB
          </Box>
          <Box fontSize="body-s" color="text-body-secondary">
            2022-01-01T12:02:02
          </Box>
        </SpaceBetween>
      </div>
    </Box>
  );
}
