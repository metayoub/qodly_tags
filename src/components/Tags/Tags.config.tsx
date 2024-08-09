import {
  EComponentKind,
  splitDatasourceID,
  T4DComponentConfig,
  T4DComponentDatasourceDeclaration,
} from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { MdCircle } from 'react-icons/md';

import TagsSettings, { BasicSettings } from './Tags.settings';

export default {
  craft: {
    displayName: 'Tags',
    kind: EComponentKind.BASIC,
    props: {
      iterable: true,
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(TagsSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'Tags',
    exposed: true,
    icon: MdCircle,
    events: [
      {
        label: 'On Click',
        value: 'onclick',
      },
      {
        label: 'On Blur',
        value: 'onblur',
      },
      {
        label: 'On Focus',
        value: 'onfocus',
      },
      {
        label: 'On MouseEnter',
        value: 'onmouseenter',
      },
      {
        label: 'On MouseLeave',
        value: 'onmouseleave',
      },
      {
        label: 'On KeyDown',
        value: 'onkeydown',
      },
      {
        label: 'On KeyUp',
        value: 'onkeyup',
      },
    ],
    datasources: {
      accept: ['entitysel'],
      declarations: (props: ITagsProps) => {
        const { attribut, currentElement = '', datasource = '' } = props;
        const declarations: T4DComponentDatasourceDeclaration[] = [
          { path: datasource, iterable: true },
          { path: currentElement },
        ];
        if (attribut) {
          const { id: ds, namespace } = splitDatasourceID(datasource?.trim()) || {};
          const { id: currentDs, namespace: currentDsNamespace } =
            splitDatasourceID(currentElement) || {};

          if (!ds && !currentDs) {
            return;
          }
          if (currentDs && currentDsNamespace === namespace) {
            const colSrcID = `${currentDs}.${attribut}`;
            declarations.push({
              path: namespace ? `${namespace}:${colSrcID}` : colSrcID,
            });
          }

          const fieldSrc = `${ds}.[].${attribut}`;
          declarations.push({
            path: namespace ? `${namespace}:${fieldSrc}` : fieldSrc,
          });
        }

        return declarations;
      },
    },
  },
  defaultProps: {
    iterableChild: true,
    attribut: '',
    style: {
      display: 'inline-block',
      backgroundColor: 'rgb(218, 216, 216)',
      color: 'rgb(48, 48, 48)',
      paddingBottom: '6px',
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingTop: '6px',
      marginRight: '2px',
      marginBottom: '0px',
      marginLeft: '0px',
      marginTop: '0px',
      alignItems: 'center',
      borderRadius: '12px',
    },
  },
} as T4DComponentConfig<ITagsProps>;

export interface ITagsProps extends webforms.ComponentProps {
  attribut?: string;
}