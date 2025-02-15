import * as React from 'react';
import { useEventCallback, resolveShorthand, useMergedRefs, getNativeElementProps } from '@fluentui/react-utilities';
import { useFluent_unstable as useFluent } from '@fluentui/react-shared-contexts';
import { useCharacterSearch } from './useCharacterSearch';
import { useMenuTriggerContext_unstable } from '../../contexts/menuTriggerContext';
import {
  ChevronRightFilled,
  ChevronRightRegular,
  ChevronLeftFilled,
  ChevronLeftRegular,
  bundleIcon,
} from '@fluentui/react-icons';
import { useMenuListContext_unstable } from '../../contexts/menuListContext';
import { useMenuContext_unstable } from '../../contexts/menuContext';
import type { MenuItemProps, MenuItemState } from './MenuItem.types';
import type { ARIAButtonElement, ARIAButtonElementIntersection, ARIAButtonSlotProps } from '@fluentui/react-aria';
import { useARIAButtonShorthand } from '@fluentui/react-aria';
import { Enter, Space } from '@fluentui/keyboard-keys';

const ChevronRightIcon = bundleIcon(ChevronRightFilled, ChevronRightRegular);
const ChevronLeftIcon = bundleIcon(ChevronLeftFilled, ChevronLeftRegular);

/**
 * Returns the props and state required to render the component
 */
export const useMenuItem_unstable = (props: MenuItemProps, ref: React.Ref<ARIAButtonElement<'div'>>): MenuItemState => {
  const isSubmenuTrigger = useMenuTriggerContext_unstable();
  const persistOnClickContext = useMenuContext_unstable(context => context.persistOnItemClick);
  const {
    as = 'div',
    disabled,
    disabledFocusable,
    hasSubmenu = isSubmenuTrigger,
    persistOnClick = persistOnClickContext,
  } = props;
  const hasIcons = useMenuListContext_unstable(context => context.hasIcons);
  const hasCheckmarks = useMenuListContext_unstable(context => context.hasCheckmarks);
  const setOpen = useMenuContext_unstable(context => context.setOpen);

  const { dir } = useFluent();
  const innerRef = React.useRef<ARIAButtonElementIntersection<'div'>>(null);
  const dismissedWithKeyboardRef = React.useRef(false);

  const isDisabled = Boolean(disabled || disabledFocusable);

  const state: MenuItemState = {
    hasSubmenu,
    disabled: isDisabled,
    persistOnClick,
    components: {
      root: 'div',
      icon: 'span',
      checkmark: 'span',
      submenuIndicator: 'span',
      content: 'span',
      secondaryContent: 'span',
    },
    isNativeButton: as === 'button',
    root: getNativeElementProps(
      as,
      useARIAButtonShorthand<ARIAButtonSlotProps<'div'>>(
        { disabled: false, disabledFocusable: isDisabled, as },
        {
          required: true,
          defaultProps: {
            role: 'menuitem',
            ...props,
            ref: useMergedRefs(ref, innerRef) as React.Ref<ARIAButtonElementIntersection<'div'>>,
            onKeyDown: useEventCallback(event => {
              props.onKeyDown?.(event);
              if (!event.isDefaultPrevented() && (event.key === Space || event.key === Enter)) {
                dismissedWithKeyboardRef.current = true;
              }
            }),
            onMouseEnter: useEventCallback(event => {
              innerRef.current?.focus();

              props.onMouseEnter?.(event);
            }),
            onClick: useEventCallback(event => {
              if (!hasSubmenu && !persistOnClick) {
                setOpen(event, { open: false, keyboard: dismissedWithKeyboardRef.current, bubble: true });
                dismissedWithKeyboardRef.current = false;
              }

              props.onClick?.(event);
            }),
          },
        },
      ),
    ),
    icon: resolveShorthand(props.icon, { required: hasIcons }),
    checkmark: resolveShorthand(props.checkmark, { required: hasCheckmarks }),
    submenuIndicator: resolveShorthand(props.submenuIndicator, {
      required: hasSubmenu,
      defaultProps: {
        children: dir === 'ltr' ? <ChevronRightIcon /> : <ChevronLeftIcon />,
      },
    }),
    content: resolveShorthand(props.content, {
      required: !!props.children,
      defaultProps: { children: props.children },
    }),
    secondaryContent: resolveShorthand(props.secondaryContent),
  };
  useCharacterSearch(state, innerRef);
  return state;
};
