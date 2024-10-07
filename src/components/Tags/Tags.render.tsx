import {
  EntityProvider,
  useEnhancedEditor,
  useRenderer,
  useSources,
  selectResolver,
  useEnhancedNode,
  useDataLoader,
  useDsChangeHandler,
  entitySubject,
  EntityActions,
} from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';
import { Element } from '@ws-ui/craftjs-core';
import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({
  enableAction = true,
  iconLoader,
  iconAction,
  iterator,
  style,
  componentWidth,
  componentHeight,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer({
    omittedEvents: ['onclick', 'onclickaction'],
    autoBindEvents: false,
  });
  const { id: nodeID } = useEnhancedNode();
  const [selected, setSelected] = useState(-1);
  const [_scrollIndex, setScrollIndex] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const { resolver } = useEnhancedEditor(selectResolver);
  const {
    sources: { datasource: ds, currentElement: currentDs },
  } = useSources({
    acceptIteratorSel: true,
  });
  let step = { start: 0, end: 99 };
  const [count, setCount] = useState(0);

  const { setStep, page, entities, fetchIndex } = useDataLoader({
    source: ds,
    step,
  });

  const { updateCurrentDsValue } = useDsChangeHandler({
    source: ds,
    currentDs,
    selected,
    setSelected,
    setScrollIndex,
    setCount,
    fetchIndex,
    onDsChange: (length, selected) => {
      if (selected >= 0) {
        updateCurrentDsValue({
          index: selected < length ? selected : 0,
          forceUpdate: true,
        });
      }
    },
    onCurrentDsChange: (selected) => {
      entitySubject.next({
        action: EntityActions.UPDATE,
        payload: {
          nodeID,
          rowIndex: selected,
        },
      });
    },
  });

  const loadMore = () => {
    console.log({ page, entities, fetchIndex });
    setStep({
      start: 0,
      end: page.end + pageSize,
    });

    fetchIndex(0);
  };

  const handleAction = async (e: any, index: number) => {
    await updateCurrentDsValue({ index });
    e.stopPropagation();
    emit('onclickaction');
  };

  const handleClick = async (index: number) => {
    setSelected(index);
    await updateCurrentDsValue({ index });
    emit('onclick');
  };

  useEffect(() => {
    // select current element
    if (currentDs && selected === -1) {
      try {
        let index = -1;
        if (currentDs.type === 'entity') {
          index = (currentDs as any).getEntity()?.getPos();
        } else if (
          currentDs.type === 'scalar' &&
          currentDs.dataType === 'object' &&
          currentDs.parentSource
        ) {
          index = (currentDs as any).getPos();
        }
        if (index >= 0) {
          setSelected(index);
          setScrollIndex(index);
        }
      } catch (e) {
        // proceed
      }
    }
  }, []);

  useEffect(() => {
    if (!ds) return;
    // workAround for PageSize
    const pageSize = ds.getPageSize();
    setPageSize(pageSize);
    setStep({
      start: 0,
      end: pageSize,
    });

    fetchIndex(0);
  }, []);

  return (
    <div
      ref={connect}
      className={cn(className, classNames)}
      style={{ width: componentWidth, height: componentHeight }}
    >
      {entities ? (
        <>
          {entities.map((_tag, index) => (
            <div
              className={`items-center space-x-2 ${selected === index && 'selected'}`}
              style={style}
              key={index}
              onClick={() => handleClick(index)}
            >
              <EntityProvider
                index={index}
                selection={ds}
                current={currentDs?.id}
                iterator={iterator}
              >
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
          {count > entities.length && (
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
