import { combineReducers } from 'redux';
import { summary } from '../summary/redux/reducer';
import { compounds } from '../compounds/redux/reducer';
import { molecule } from '../molecule/redux/reducer';

export const previewReducers = combineReducers({
  summary,
  compounds,
  molecule
});
