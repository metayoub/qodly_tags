import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({ style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const Tags = [
    {
      name: 'Tag1',
    },
    {
      name: 'Tag2',
    },
    {
      name: 'Tag3',
    },
  ];

  return (
    <span ref={connect} className={cn(className, classNames)}>
      {Tags.map((Tag, index) => (
        <div style={style} key={index}>
          {Tag.name}
        </div>
      ))}
    </span>
  );
};

export default Tags;