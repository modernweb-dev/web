```js script
import { Button } from '../src/Button.js';

export default {
  title: 'MDJS Docs/Button',
  component: 'my-button',
};

const Template = args => Button(args);
```

# Button

This is a demo showing the button component

```js preview-story
export const Primary = Template.bind({});
Primary.args = { primary: true, label: 'Button' };
```

```js preview-story
export const Secondary = Template.bind({});
Secondary.args = { label: 'Button' };
```

```js preview-story
export const Large = Template.bind({});
Large.args = { size: 'large', label: 'Button' };
```

```js preview-story
export const Small = Template.bind({});
Small.args = { size: 'small', label: 'Button' };
```

## Level 2 heading

- a list
- of things
- to be
- listed

[A link somewhere](./foo.js)

## Code block

```js
console.log('Hello world');
```
