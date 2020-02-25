import { resetCurrentCompoundsSettings, setCurrentCompounds } from '../../components/preview/compounds/redux/actions';
import { setFilter, selectVector } from './actions';
import { getAllCompoundsList } from './selectors';
import { MOL_ATTRIBUTES } from '../../components/preview/molecule/redux/constants';

export const selectVectorAndResetCompounds = currentVector => async (dispatch, getState) => {
  await dispatch(resetCurrentCompoundsSettings(false));
  dispatch(selectVector(currentVector));
  dispatch(setCurrentCompounds(getAllCompoundsList(getState())));
};

export const getListedMolecules = (object_selection, cached_mol_lists) => {
  let molecules = [];
  if ((object_selection || []).length) {
    for (let molgroupId of object_selection) {
      // Selected molecule groups
      const molGroup = cached_mol_lists[molgroupId];
      if (molGroup) {
        molecules = molecules.concat(molGroup.results);
      } else {
        console.log(`Molecule group ${molgroupId} not found in cached list`);
      }
    }
  }

  return molecules;
};

export const initializeFilter = (object_selection, cached_mol_lists) => (dispatch, getState) => {
  const state = getState();
  if (!object_selection || !cached_mol_lists) {
    object_selection = state.selectionReducers.mol_group_selection;
    cached_mol_lists = state.apiReducers.cached_mol_lists;
  }

  let initObject = state.selectionReducers.filter;

  if (initObject === undefined) {
    initObject = {
      active: false,
      predefined: 'none',
      filter: {},
      priorityOrder: MOL_ATTRIBUTES.map(molecule => molecule.key)
    };
  } else {
    console.log('using saved filter');
  }

  for (let attr of MOL_ATTRIBUTES) {
    console.log(lowAttr);
    const lowAttr = attr.key.toLowerCase();
    let minValue = -999999;
    let maxValue = 0;
    for (let molecule of getListedMolecules(object_selection, cached_mol_lists)) {
      const attrValue = molecule[lowAttr];
      if (attrValue > maxValue) maxValue = attrValue;
      if (minValue === -999999) minValue = maxValue;
      if (attrValue < minValue) minValue = attrValue;
      console.log(minValue, maxValue);
    }

    initObject.filter[attr.key] = {
      priority: 0,
      order: 1,
      minValue: minValue,
      maxValue: maxValue,
      isFloat: attr.isFloat
    };
  }
  dispatch(setFilter(initObject));
  return initObject;
};
