import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { IGroup } from '~/apis';
import { nodeService } from '~/service';
import { GROUP_CONFIG_KEY } from '~/utils/constant';

type Props = {
  width: number
  height: number
  fontSize: number
  groupIcon?: string
  className?: string
  colorClassName?: string
} & ({
  groupName: string
} | {
  group: IGroup
});

export const GroupIcon = observer((props: Props) => {
  const groupIconFromConfig = 'group' in props
    ? nodeService.state.configMap.get(props.group.group_id)?.[GROUP_CONFIG_KEY.GROUP_ICON] as string ?? ''
    : '';
  const groupIcon = props.groupIcon ?? groupIconFromConfig;
  const groupName = 'group' in props
    ? props.group.group_name
    : props.groupName;

  if (!groupIcon) {
    return (
      <div>
        <div
          className={classNames(
            'flex flex-center group-letter font-bold uppercase bg-gray-af leading-none select-none',
            props.colorClassName ?? 'text-white',
            props.className,
          )}
          style={{
            width: props.width,
            height: props.height,
            fontSize: props.fontSize,
            fontFamily: "Varela Round, Nunito Sans, PingFang SC, Hiragino Sans GB, Heiti SC, '幼圆', '圆体-简', sans-serif",
          }}
        >
          {groupName.trim().substring(0, 1)}
        </div>
      </div>
    );
  }

  return (
    <img
      className={props.className || ''}
      src={groupIcon}
      width={props.width}
      height={props.height}
      alt='icon'
    />
  );
});
