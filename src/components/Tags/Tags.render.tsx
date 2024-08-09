import { DataLoader, updateEntity, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({
  enableAction = true,
  iconLoader,
  iconAction,
  attribut,
  style,
  componentWidth,
  componentHeight,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer({
    omittedEvents: ['onclick', 'onclickaction'],
  });
  const [tags, setTags] = useState<datasources.IEntity[]>(() => []);
  const [fullLength, setFullLength] = useState<number>(0);
  const {
    sources: { datasource: ds, currentElement },
  } = useSources();

  const loader = useMemo<DataLoader | null>(() => {
    if (!ds) {
      return null;
    }

    return DataLoader.create(ds, [attribut as string]);
  }, [attribut, ds]);

  const updateFromLoader = useCallback(() => {
    if (!loader) {
      return;
    }
    setTags((prev) => [...prev, ...loader.page]);
    setFullLength(loader.length);
  }, [loader]);

  useEffect(() => {
    if (!loader || !ds) {
      return;
    }

    const dsListener = () => {
      loader.sourceHasChanged().then(updateFromLoader);
    };
    ds.addListener('changed', dsListener);
    return () => {
      ds.removeListener('changed', dsListener);
    };
  }, [ds, updateFromLoader]);

  const updateCurrentDsValue = async ({
    index,
    forceUpdate = false,
    fireEvent = true,
  }: {
    index: number;
    forceUpdate?: boolean;
    fireEvent?: boolean;
  }) => {
    if (!ds || !currentElement || !forceUpdate) {
      return;
    }
    await updateEntity({ index, datasource: ds, currentElement, fireEvent });
  };

  const loadMore = () => {
    if (loader && fullLength > tags.length) {
      const newStart = loader.end;
      loader?.fetchPage(newStart).then(updateFromLoader);
    }
  };

  const handleAction = (e: any) => {
    e.stopPropagation();
    emit('onclickaction');
  };

  const handleClick = (index: number) => {
    updateCurrentDsValue({ index, forceUpdate: true });
    emit('onclick');
  };

  // TODO: can we do it like a Matrix
  // TODO: handle if attribute is not defined
  // TODO: to see if we need to change the css of the selected element or not.
  // TODO: if the width is fix make sur that you display a part of text. (maybe a css example can do it)

  return (
    <div
      ref={connect}
      className={cn(className, classNames, 'overflow-auto')}
      style={{ width: componentWidth, height: componentHeight }}
    >
      {loader ? (
        <>
          {tags.map((tag, index) => (
            <div
              className="cursor-pointer flex items-center space-x-2"
              style={style}
              key={index}
              onClick={() => handleClick(index)}
            >
              <span>{tag[attribut as keyof typeof tag] as string}</span>
              {enableAction && (
                <div
                  className={cn('action cursor-pointer fa', iconAction)}
                  onClick={handleAction}
                />
              )}
            </div>
          ))}
          {fullLength > tags.length && (
            <div
              style={{ ...style, width: '' }}
              className={cn('load-more cursor-pointer fa leading-normal', iconLoader)}
              onClick={loadMore}
            >
              &#8203;
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-purple-400 py-4 text-white">
          <p>Error</p>
        </div>
      )}
    </div>
  );
};

export default Tags;
