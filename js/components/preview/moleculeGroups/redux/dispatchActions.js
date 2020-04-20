import { generateComplex, generateMolecule, generateSphere } from '../../molecule/molecules_helpers';
import { VIEWS } from '../../../../constants/constants';
import {
  decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState,
  deleteObject,
  loadObject,
  reloadNglViewFromSnapshot
} from '../../../../reducers/ngl/dispatchActions';
import { getJoinedMoleculeList } from '../../molecule/redux/selectors';
import {
  removeFromComplexList,
  removeFromProteinList,
  removeFromSurfaceList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList,
  resetSelectionState,
  setComplexList,
  setFilterSettings,
  setFragmentDisplayList,
  setMolGroupSelection,
  setObjectSelection,
  setVectorList,
  setVectorOnList,
  setFirstLoad
} from '../../../../reducers/selection/actions';
import { removeMoleculeOrientation, setCountOfRemainingMoleculeGroups } from '../../../../reducers/ngl/actions';
import { setMolGroupList, setMolGroupOn } from '../../../../reducers/api/actions';
import { getUrl, loadFromServer } from '../../../../utils/genericList';
import { OBJECT_TYPE } from '../../../nglView/constants';
import { setSortDialogOpen } from '../../molecule/redux/actions';
import { resetCurrentCompoundsSettings } from '../../compounds/redux/actions';

export const clearAfterDeselectingMoleculeGroup = ({ molGroupId, currentMolGroup, majorViewStage }) => (
  dispatch,
  getState
) => {
  dispatch(setObjectSelection([molGroupId]));

  let site;
  const state = getState();
  const vector_list = state.selectionReducers.vector_list;

  // loop through all molecules
  getJoinedMoleculeList(state).forEach(mol => {
    site = mol.site;
    // remove Ligand
    dispatch(
      deleteObject(
        Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolecule(mol.id.toString(), mol.sdf_info)),
        majorViewStage
      )
    );

    // remove Complex, Protein, Surface
    ['contacts', 'protein', 'surface'].forEach(type => {
      dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateComplex(mol.id.toString(), mol.protein_code, mol.sdf_info, mol.molecule_protein, type)
          ),
          majorViewStage
        )
      );
    });
  });

  // remove all Vectors
  vector_list
    .filter(v => v.site === site)
    .forEach(item => {
      dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), majorViewStage));
    });

  dispatch(setObjectSelection(undefined));

  // remove molecule orientation for given site
  dispatch(removeMoleculeOrientation(site));

  // remove all selected ALCV of given site
  currentMolGroup.mol_id.forEach(moleculeID => {
    // remove Ligand, Complex, Vectors from selection
    //Ligand
    dispatch(removeFromFragmentDisplayList({ id: moleculeID }));
    // Complex
    dispatch(removeFromComplexList({ id: moleculeID }));
    // Protein
    dispatch(removeFromProteinList({ id: moleculeID }));
    // Surface
    dispatch(removeFromSurfaceList({ id: moleculeID }));
    // Vectors
    dispatch(removeFromVectorOnList({ id: moleculeID }));
  });
};

export const saveMoleculeGroupsToNglView = (molGroupList, stage, projectId) => dispatch => {
  if (molGroupList) {
    dispatch(setCountOfRemainingMoleculeGroups(molGroupList.length));
    molGroupList.map(data =>
      dispatch(loadObject(Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(data)), stage)).then(() =>
        dispatch(decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState(projectId))
      )
    );
  }
};

export const selectMoleculeGroup = (moleculeGroup, summaryViewStage) => (dispatch, getState) => {
  const state = getState();
  const moleculeGroupSelection = state.selectionReducers.mol_group_selection.slice();
  const currentMolGroupStringID = `${OBJECT_TYPE.MOLECULE_GROUP}_${moleculeGroup.id}`;
  // update redux states
  dispatch(setMolGroupOn(moleculeGroup.id));
  moleculeGroupSelection.push(moleculeGroup.id);
  dispatch(setMolGroupSelection(moleculeGroupSelection));
  // re-render molecule group in NGL summary view
  dispatch(
    deleteObject(
      {
        display_div: VIEWS.SUMMARY_VIEW,
        name: currentMolGroupStringID
      },
      summaryViewStage
    )
  );
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(moleculeGroup, true)),
      summaryViewStage
    )
  );
};

export const selectFirstMolGroup = ({ summaryView }) => (dispatch, getState) => {
  const currentMolGroup = getState().apiReducers.mol_group_list[0];
  if (currentMolGroup) {
    dispatch(selectMoleculeGroup(currentMolGroup, summaryView));
    dispatch(setFirstLoad(true));
  }
};

export const loadMoleculeGroups = ({
  summaryView,
  setOldUrl,
  oldUrl,
  onCancel,
  isStateLoaded,
  projectId,
  hideProjects
}) => (dispatch, getState) => {
  const state = getState();
  const group_type = state.apiReducers.group_type;
  const target_on = state.apiReducers.target_on;
  const list_type = OBJECT_TYPE.MOLECULE_GROUP;

  if (target_on && !isStateLoaded) {
    return loadFromServer({
      url: getUrl({ list_type, target_on, group_type }),
      setOldUrl: url => setOldUrl(url),
      old_url: oldUrl,
      afterPush: data_list => dispatch(saveMoleculeGroupsToNglView(data_list, summaryView, projectId)),
      list_type,
      setObjectList: async mol_group_list => {
        await dispatch(setMolGroupList(mol_group_list));
        if (hideProjects) {
          dispatch(selectFirstMolGroup({ summaryView }));
        }
      },
      cancel: onCancel
    });
  } else if (target_on && isStateLoaded) {
    // to enable user interaction with application
    dispatch(setCountOfRemainingMoleculeGroups(0));
  }
  return Promise.resolve();
};

export const clearMoleculeGroupSelection = ({ getNglView }) => (dispatch, getState) => {
  // Reset NGL VIEWS to default state
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const summaryViewStage = getNglView(VIEWS.SUMMARY_VIEW) && getNglView(VIEWS.SUMMARY_VIEW).stage;
  const snapshot = getState().projectReducers.currentSnapshot.data.nglReducers;

  dispatch(reloadNglViewFromSnapshot(majorViewStage, VIEWS.MAJOR_VIEW, snapshot));
  dispatch(reloadNglViewFromSnapshot(summaryViewStage, VIEWS.SUMMARY_VIEW, snapshot));

  // Reset selection reducer
  // remove sites selection
  dispatch(setMolGroupOn(undefined));
  dispatch(setMolGroupSelection([]));

  // reset all selection state
  dispatch(resetSelectionState());

  // remove Ligand, Complex, Vectors from selection
  //Ligand
  dispatch(setFragmentDisplayList([]));
  // Complex
  dispatch(setComplexList([]));
  // Vectors
  dispatch(setVectorOnList([]));
  dispatch(setVectorList([]));

  // reset filterSettings of molecules
  dispatch(setFilterSettings(undefined));
  // close sort dialog
  dispatch(setSortDialogOpen(false));

  // reset compounds
  dispatch(resetCurrentCompoundsSettings(true));
};

export const onSelectMoleculeGroup = ({ moleculeGroup, stageSummaryView, majorViewStage, event }) => (
  dispatch,
  getState
) => {
  const state = getState();
  const mol_group_list = state.apiReducers.mol_group_list;
  const mol_group_selection = state.selectionReducers.mol_group_selection;

  const objIdx = mol_group_selection.indexOf(moleculeGroup.id);
  const selectionCopy = mol_group_selection.slice();
  const currentMolGroup = mol_group_list.find(o => o.id === moleculeGroup.id);
  const currentMolGroupStringID = `${OBJECT_TYPE.MOLECULE_GROUP}_${moleculeGroup.id}`;
  if (event.target.checked && objIdx === -1) {
    dispatch(selectMoleculeGroup(currentMolGroup, stageSummaryView));
  } else if (!event.target.checked && objIdx > -1) {
    dispatch(
      clearAfterDeselectingMoleculeGroup({
        molGroupId: moleculeGroup.id,
        currentMolGroup,
        majorViewStage
      })
    );
    selectionCopy.splice(objIdx, 1);
    dispatch(
      deleteObject(
        {
          display_div: VIEWS.SUMMARY_VIEW,
          name: currentMolGroupStringID
        },
        stageSummaryView
      )
    );
    dispatch(
      loadObject(
        Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(currentMolGroup, false)),
        stageSummaryView
      )
    );
    dispatch(setMolGroupSelection(selectionCopy));
    if (selectionCopy.length > 0) {
      dispatch(setMolGroupOn(selectionCopy.slice(-1)[0]));
    } else {
      dispatch(setMolGroupOn(undefined));
    }
  }
};
