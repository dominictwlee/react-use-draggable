import React, { FC, HTMLAttributes, ReactChild } from 'react';
import useDraggable from './useDraggable';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactChild;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * A custom Thing component. Neat!
 */
export const Thing: FC<Props> = ({ children }) => {
  const { style, ...draggableProps } = useDraggable<HTMLDivElement>();
  return (
    <div
      {...draggableProps}
      style={{
        height: 100,
        width: 100,
        backgroundColor: 'yellow',
        ...style,
      }}
    >
      {children || `the snozzberries taste like snozzberries`}
    </div>
  );
};
