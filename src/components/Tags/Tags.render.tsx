import {
  DataLoader,
  EntityProvider,
  selectResolver,
  updateEntity,
  useEnhancedEditor,
  useRenderer,
  useSources,
} from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Element } from '@ws-ui/craftjs-core';
import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({
  enableAction = true,
  iconLoader,
  iconAction,
  style,
  componentWidth,
  componentHeight,
  iterator,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer({
    omittedEvents: ['onclick', 'onclickaction'],
  });
  const [tags, setTags] = useState<datasources.IEntity[]>(() => []);
  const [fullLength, setFullLength] = useState<number>(0);
  const [selected, setSelected] = useState<number>(-1);
  const {
    sources: { datasource: ds, currentElement },
  } = useSources({ acceptIteratorSel: true });
  const { resolver } = useEnhancedEditor(selectResolver);
  const loader = useMemo<DataLoader | null>(() => {
    if (!ds) {
      return null;
    }

    return DataLoader.create(ds, ds.dataclass.getKeys()); // TODO: ugly workaround
  }, [ds]);

  const updateFromLoader = useCallback(() => {
    if (!loader) {
      return;
    }
    setTags((prev) => [...prev, ...loader.page]);
    setFullLength(loader.length);
  }, [loader]);

  // need this to work in rederer
  useEffect(() => {
    if (!loader || !ds) return;

    loader.sourceHasChanged().then(updateFromLoader);
  }, []);

  useEffect(() => {
    if (!loader || !ds) {
      return;
    }

    const dsListener = () => {
      setTags([]);
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

  const handleAction = async (e: any, index: number) => {
    await updateCurrentDsValue({ index, forceUpdate: true });
    e.stopPropagation();
    emit('onclickaction');
  };

  const handleClick = async (index: number) => {
    await updateCurrentDsValue({ index, forceUpdate: true });
    emit('onclick');
  };

  const getParentEntitySel = (
    source: datasources.DataSource,
    dataclassID: string,
  ): datasources.DataSource | null => {
    const parent = source.getParentSource();
    if (!parent) {
      return null;
    } else if (parent.type === 'entitysel' && parent.dataclassID === dataclassID) {
      return parent;
    }

    return getParentEntitySel(parent, dataclassID);
  };
  // handle selelctElement
  const currentDsChangeHandler = useCallback(async () => {
    if (!currentElement) {
      return;
    }

    const parent = getParentEntitySel(currentElement, currentElement.dataclassID) || ds;
    const entity = (currentElement as any).getEntity();
    if (entity) {
      let currentIndex = entity.getPos();
      if (currentIndex == null && parent) {
        // used "==" to handle both null & undefined values
        currentIndex = await parent.findElementPosition(currentElement);
      }
      if (typeof currentIndex === 'number') {
        setSelected(currentIndex);
      }
    } else {
      setSelected(-1);
    }
  }, [currentElement]);

  useEffect(() => {
    if (!currentElement) {
      return;
    }
    // Get The selected element position
    currentDsChangeHandler();
  }, []);

  useEffect(() => {
    if (!currentElement) {
      return;
    }
    currentElement.addListener('changed', currentDsChangeHandler);
    return () => {
      currentElement.removeListener('changed', currentDsChangeHandler);
    };
  }, [currentDsChangeHandler]);

  return (
    <div
      ref={connect}
      className={cn(className, classNames)}
      style={{ width: componentWidth, height: componentHeight }}
    >
      {loader ? (
        <>
          {tags.map((_tag, index) => (
            <div
              className={`items-center space-x-2 ${selected === index && 'selected'}`}
              style={style}
              key={index}
              onClick={() => handleClick(index)}
            >
              <EntityProvider index={index} selection={ds} current={ds?.id} iterator={iterator}>
                <Element
                  is={resolver.Text}
                  id="container"
                  className="fd-selectbox__container"
                  canvas
                />
              </EntityProvider>
              {enableAction && (
                <div
                  className={cn('action cursor-pointer fa', iconAction)}
                  onClick={(e) => handleAction(e, index)}
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
