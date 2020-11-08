```js script
import { Meta, Story, Canvas, ArgsTable } from '@web/storybook-prebuilt/addon-docs/blocks.js';
import { Button } from '../src/Button.js';

export default {
  title: 'MDJS Docs/Button',
  component: 'my-button',
};

export const Template = args => Button(args);
```

# Button

This is a demo showing the button component

export const Template = args => Button(args);

```js story
export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: 'Button',
};
```

## Level 2 heading

- a list
- of things
- to be
- listed

[A link somewhere](./foo.js)
