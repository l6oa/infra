import { Instance, render } from 'ink';
import { ComponentType, createElement } from 'react';

export class Renderer {
  component: ComponentType<any>;
  inkRender: Instance | null = null;

  constructor(component: ComponentType<any>) {
    this.component = component;
    this.inkRender = null;
  }

  render(props: any) {
    const element = createElement(this.component, props);

    if (!this.inkRender) {
      this.inkRender = render(element);
    } else {
      this.inkRender.rerender(element);
    }
  }

  end() {
    this.inkRender?.unmount();
  }
}
