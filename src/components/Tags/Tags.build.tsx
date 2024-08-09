import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';
import { MdWarning } from 'react-icons/md';
import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({
  enableAction = true,
  iconAction,
  iconLoader,
  componentHeight,
  componentWidth,
  datasource,
  style,
  className,
  classNames = [],
}) => {
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
    <div
      ref={connect}
      className={cn(className, classNames)}
      style={{ width: componentWidth, height: componentHeight }}
    >
      {datasource ? (
        <>
          {Tags.map((tag, index) => (
            <div className="cursor-pointer flex items-center space-x-2" style={style} key={index}>
              <span>{tag.name}</span>
              {enableAction && <div className={cn('action cursor-pointer fa', iconAction)} />}
            </div>
          ))}

          <div
            style={{ ...style, width: '' }}
            className={cn('load-more cursor-pointer fa leading-normal', iconLoader)}
          >
            &#8203;
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-purple-400 py-4 text-white">
          <MdWarning className="mb-1 h-8 w-8" />
          <p>Please attach a datasource</p>
        </div>
      )}
    </div>
  );
};

export default Tags;
