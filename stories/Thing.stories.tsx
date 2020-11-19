import React, { FC, HTMLAttributes, ReactChild } from 'react';
import { Meta, Story } from '@storybook/react';
import { useDraggable } from '../src';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactChild;
}

const Thing: FC<Props> = ({ children }) => {
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

const meta: Meta = {
  title: 'Welcome',
  component: Thing,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<Props> = args => <Thing {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
