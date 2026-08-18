import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import SecurityPanel from './security-panel';

describe('SecurityPanel', () => {
  let container: HTMLDivElement;
  let root: ReactDOM.Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    document.body.removeChild(container);
  });

  it('should render the "Go+ Security" FAB button', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 1 }));
    const text = container.textContent;
    expect(text).toContain('Go+ Security');
  });

  it('should render a button with className swap-security-fab', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 1 }));
    const fab = container.querySelector('.swap-security-fab');
    expect(fab).toBeTruthy();
  });

  it('should render a shield icon', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 1 }));
    const icon = container.querySelector('.material-icons');
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toBe('shield');
  });

  it('should show drawer with "Go+ Security" header after clicking FAB', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 1 }));
    const fab = container.querySelector('.swap-security-fab') as HTMLButtonElement;
    expect(fab).toBeTruthy();
    fab.click();

    const drawer = container.querySelector('.swap-security-drawer');
    expect(drawer).toBeTruthy();
    expect(drawer?.getAttribute('aria-label')).toBe('Go+ Security');

    const headerText = container.querySelector('.swap-security-drawer-header');
    expect(headerText?.textContent).toContain('Go+ Security');
  });

  it('should close drawer when clicking close button', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 1 }));
    const fab = container.querySelector('.swap-security-fab') as HTMLButtonElement;
    fab.click();

    const closeBtn = container.querySelector('.swap-security-close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();

    expect(container.querySelector('.swap-security-drawer')).toBeNull();
    expect(container.querySelector('.swap-security-fab')).toBeTruthy();
  });

  it('should close drawer when clicking backdrop', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 1 }));
    (container.querySelector('.swap-security-fab') as HTMLButtonElement).click();

    const backdrop = container.querySelector('.swap-security-backdrop') as HTMLDivElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();

    expect(container.querySelector('.swap-security-drawer')).toBeNull();
  });

  it('should show simulation warning in Shibarium mode (chainId 109)', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 109, mode: 'simulation' }));
    (container.querySelector('.swap-security-fab') as HTMLButtonElement).click();

    const text = container.textContent || '';
    expect(text).toContain('simulación de transacciones');
  });

  it('should show token verification input in full mode', () => {
    root.render(React.createElement(SecurityPanel, { chainId: 1, mode: 'full' }));
    (container.querySelector('.swap-security-fab') as HTMLButtonElement).click();

    const input = container.querySelector('input[placeholder*="0x"]') as HTMLInputElement;
    expect(input).toBeTruthy();
  });

  it('should apply custom style prop', () => {
    root.render(
      React.createElement(SecurityPanel, {
        chainId: 1,
        style: { position: 'fixed', top: 72, right: 16 },
      })
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.position).toBe('fixed');
    expect(wrapper.style.top).toBe('72px');
    expect(wrapper.style.right).toBe('16px');
  });
});
