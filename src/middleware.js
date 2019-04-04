import invariant from 'invariant';

import {actionsPrefix} from './constants';
import {getActiveBottomTabsId, getActiveTopTabsId, getActiveScreenId} from './selectors';
import {getNavigator} from './init';
import {getActiveScreenOfTab, getActiveComponentId} from './helpers';
import {middlewareActionTypes, middlewareActionTypesArray} from './actions';

export const navigatorMiddleware = store => next => action => {
  if (!action || !action.type || !typeof(action.type) === 'string' || !action.type.startsWith(actionsPrefix) || !middlewareActionTypesArray.includes(action.type)) {
    return next(action);
  }
  const navigator = getNavigator();
  const state = store.getState();
  const {activities} = state;
  invariant(activities, "You probably didn't import and apply activities reducer");
  switch (action.type) {
    case middlewareActionTypes.push:
      {
        const {layout, options} = action.payload;
        let activeScreenId;
        if (options) {
          const {bottomTabIndex, topTabIndex} = options;
          let tabsId;
          let nextActiveIndex;
          if (bottomTabIndex !== undefined) {
            tabsId = getActiveBottomTabsId(state);
            activeScreenId = getActiveScreenOfTab(activities.root, tabsId, bottomTabIndex);
            nextActiveIndex = bottomTabIndex;
          }
          if (topTabIndex !== undefined) {
            tabsId = getActiveTopTabsId(state);
            activeScreenId = getActiveScreenOfTab(activities.root, tabsId, topTabIndex);
            nextActiveIndex = topTabIndex;
          }
          navigator.mergeOptions(tabsId, {
            bottomTabs: {
              currentTabIndex: nextActiveIndex
            }
          });
        } else {
          activeScreenId = getActiveScreenId(state);
        }
        return navigator.push(activeScreenId, layout);
      }
    case middlewareActionTypes.pop:
      {
        const activeScreenId = getActiveScreenId(state);
        return navigator.pop(activeScreenId, action.payload.mergeOptions);
      }
    case middlewareActionTypes.popToRoot:
      {
        const activeScreenId = getActiveScreenId(state);
        return navigator.popToRoot(activeScreenId, action.payload.mergeOptions);
      }
    case middlewareActionTypes.setStackRoot:
      {
        const activeScreenId = getActiveScreenId(state);
        return navigator.setStackRoot(activeScreenId, action.payload.params);
      }
    case middlewareActionTypes.dismissLastModal:
      {
        const modals = activities.modals;
        if (!modals || !modals.length) 
          return;
        const activeScreenId = getActiveComponentId(modals[modals.length - 1]);
        return navigator.dismissModal(activeScreenId, action.payload.mergeOptions);
      }
    default:
      return next(action);
  }
}
