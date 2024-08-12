import { useNode } from '@ws-ui/craftjs-core';
import { useEffect } from 'react';
import { DatasourcesActions, datasourcesSubject } from '@ws-ui/shared';
import { splitDatasourceID, useWebformPath } from '@ws-ui/webform-editor';

type Nested<T = {}> = T & { children?: T[] };
function replaceDatasource(str: string, old_reference: string, new_reference: string) {
  if (typeof str !== 'string') return str;
  const dsArr = str.split(',');

  return dsArr
    .map((ds) => {
      const [root, ...parts] = ds.split('.');

      return root === old_reference ? [new_reference, ...parts].join('.') : str;
    })
    .join(',');
}

export function findAndReplace(
  doc: Nested<{ datasource?: string; type: string }>[],
  replace: (str: string) => string,
) {
  return doc.map((el) => {
    const changes = {};
    if (el.type === 'datasource' && el.datasource) {
      Object.assign(changes, {
        datasource: replace(el.datasource),
      });
    }
    if (el.children)
      Object.assign(changes, {
        children: findAndReplace(el.children, replace),
      });
    return Object.assign({}, el, changes);
  });
}

/**
 * @exposed @hook
 *
 * A hook that subscribes to changes in datasources and performs replacements in the webform based on specified actions.
 *
 * @example
 *
 * ```tsx
 * import useDatasourceSub from "@ws-ui/webform-editor"
 *
 * const ExampleComponent = () => {
 * highlight-next-line
 * useDatasourceSub();
 * };
 * ```
 */

export default function useDatasourceSub() {
  const webformPath = useWebformPath();
  const {
    resolvedName,
    props,
    actions: { setProp },
  } = useNode((node) => {
    return {
      resolvedName: node.data.displayName,
      props: node.data.props,
    };
  });
  useEffect(() => {
    const subscription = datasourcesSubject.subscribe(
      ({ action, path, old_reference, new_reference, is_shared }) => {
        if (!is_shared && path !== webformPath) return;

        // keep track of changes for optimization.
        let changed = false;
        const new_props = { ...props };

        // replace function
        const replace = (str: string) => {
          const new_str = replaceDatasource(str, old_reference, new_reference);
          if (new_str !== str) changed = true;
          return new_str;
        };
        const oldDatasourceParts = splitDatasourceID(old_reference);
        const newDatasourceParts = splitDatasourceID(new_reference);
        switch (action) {
          case DatasourcesActions.RENAME: {
            // replace the reference in datasource and currentElement props if it exists.
            if (props.datasource) new_props.datasource = replace(new_props.datasource);
            if (props.currentElement) new_props.currentElement = replace(new_props.currentElement);
            if (props.events.length > 0) {
              new_props.events = new_props.events.map((e: webforms.WEvent) => {
                switch (e.type) {
                  case 'method': {
                    const event = e as webforms.MemberFunctionEvent;
                    let method = event.method;
                    if (
                      event.namespace === oldDatasourceParts.namespace &&
                      method?.startsWith(`${oldDatasourceParts.id}.`)
                    ) {
                      method = event.method?.replace(
                        `${oldDatasourceParts.id}.`,
                        `${newDatasourceParts.id}.`,
                      );
                      changed = true;
                    }
                    return event.params
                      ? {
                          ...event,
                          method,
                          params: event.params.map((param) => ({
                            ...param,
                            datasource: param.datasource
                              ? replace(param.datasource)
                              : param.datasource,
                          })),
                          returns: event.returns?.datasource
                            ? {
                                ...event.returns,
                                datasource: replace(event.returns.datasource),
                              }
                            : event.returns,
                        }
                      : {
                          ...event,
                          method,
                        };
                  }
                  case 'simple-action': {
                    const event = e as webforms.SimpleActionEvent;
                    const actionReplace = (
                      id: string | undefined,
                      namespace: string | undefined,
                    ) => {
                      if (!id) return id;
                      const result = replace(namespace ? `${namespace}:${id}` : id);
                      const splittedResult = result.split(':');
                      // splittedResult[1]: returns datasource id when there is a namespace
                      // splittedResult[0]: returns datasource id when there is no namespace
                      return splittedResult[1] || splittedResult[0];
                    };
                    return event.datasource
                      ? {
                          ...event,
                          datasource: {
                            ...event.datasource,
                            name: actionReplace(event.datasource.name, event.datasource.namespace),
                            from: actionReplace(event.datasource.from, event.datasource.namespace),
                            target: actionReplace(
                              event.datasource.target,
                              event.datasource.targetNamespace,
                            ),
                          },
                        }
                      : event;
                  }
                  default:
                    return e;
                }
              });
            }
            if (resolvedName === 'Text') return;
            if (changed)
              setProp((old_props: any) => {
                Object.assign(old_props, { ...new_props });
              });
          }
        }
      },
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [props]);
}
