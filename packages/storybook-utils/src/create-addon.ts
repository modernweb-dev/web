import React from 'react';
import { STORY_SPECIFIED, STORY_CHANGED, STORY_RENDERED } from '@storybook/core-events';

// A default set of Storybook events that are forwarded to the addon as they occur. If an addon
// needs additional events (either Storybook or custom events), they can be passed via the options.
const storybookEvents = [STORY_SPECIFIED, STORY_CHANGED, STORY_RENDERED];
const { Component, createRef, createElement } = React;

interface CreateAddonOptions {
  events?: string[];
}

interface AddonProps {
  api: any;
  active: boolean;
}

interface AddonState {}

export function createAddon(
  customElementName: string,
  options: CreateAddonOptions = {}
): typeof Component {
  return class extends Component<AddonProps, AddonState> {
    ref: React.RefObject<HTMLDivElement | null>;
    addonElement?: HTMLElement;

    constructor(props: AddonProps) {
      super(props);
      this.ref = createRef<HTMLDivElement | null>();
    }

    componentDidMount(): void {
      const customEvents = options.events ?? [];
      const uniqueEvents = Array.from(new Set([...storybookEvents, ...customEvents]));
      uniqueEvents.forEach(event => {
        this.props.api.getChannel().on(event, (detail: any) => {
          if (!this.addonElement) {
            this.updateAddon(event);
          }
          this.addonElement!.dispatchEvent(new CustomEvent(event, { detail }));
        });
      });
    }

    componentDidUpdate(): void {
      this.updateAddon();
    }

    updateAddon(_event?: string): void {
      if (!this.addonElement) {
        this.addonElement = document.createElement(customElementName);
      }

      const { api, active } = this.props;
      Object.assign(this.addonElement, { api, active });

      // Here, the element could get added for the first time, or re-added after a switch between addons.
      if (this.shouldAddonBeInDom() && !this.ref.current!.firstChild) {
        this.ref.current!.appendChild(this.addonElement);
      }
    }

    shouldAddonBeInDom(): boolean {
      return this.ref.current !== null && this.props.active;
    }

    render(): React.ReactElement | null {
      if (!this.props.active) {
        return null;
      }
      return createElement('div', { ref: this.ref });
    }
  };
}
