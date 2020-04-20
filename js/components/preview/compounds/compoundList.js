/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CompoundView } from './compoundView';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import { Grid, Box, makeStyles, TextField, CircularProgress } from '@material-ui/core';
import { SelectAll, Delete } from '@material-ui/icons';
import {
  clearAllSelectedCompounds,
  loadNextPageOfCompounds,
  onChangeCompoundClassValue,
  onKeyDownCompoundClass,
  selectAllCompounds
} from './redux/dispatchActions';
import { compoundsColors } from './redux/constants';
import InfiniteScroll from 'react-infinite-scroller';
import { getCanLoadMoreCompounds, getCompoundListOffset } from './redux/selectors';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 76,
    '& .MuiFormLabel-root': {
      paddingLeft: theme.spacing(1)
    }
  },
  selectedInput: {
    border: `2px groove ${theme.palette.primary.main}`
  },

  [compoundsColors.blue.key]: {
    backgroundColor: compoundsColors.blue.color
  },
  [compoundsColors.red.key]: {
    backgroundColor: compoundsColors.red.color
  },
  [compoundsColors.green.key]: {
    backgroundColor: compoundsColors.green.color
  },
  [compoundsColors.purple.key]: {
    backgroundColor: compoundsColors.purple.color
  },
  [compoundsColors.apricot.key]: {
    backgroundColor: compoundsColors.apricot.color
  },

  paddingProgress: {
    padding: theme.spacing(1),
    width: 100,
    height: 100
  },
  infinityContainer: {
    width: '100%',
    overflow: 'auto',
    padding: theme.spacing(1)
  }
}));

export const CompoundList = memo(({ height }) => {
  const classes = useStyles();
  const panelRef = useRef(null);
  const dispatch = useDispatch();
  const { getNglView } = useContext(NglContext);
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const blueInput = useSelector(state => state.previewReducers.compounds[compoundsColors.blue.key]);
  const redInput = useSelector(state => state.previewReducers.compounds[compoundsColors.red.key]);
  const greenInput = useSelector(state => state.previewReducers.compounds[compoundsColors.green.key]);
  const purpleInput = useSelector(state => state.previewReducers.compounds[compoundsColors.purple.key]);
  const apricotInput = useSelector(state => state.previewReducers.compounds[compoundsColors.apricot.key]);

  const inputs = {
    [compoundsColors.blue.key]: blueInput,
    [compoundsColors.red.key]: redInput,
    [compoundsColors.green.key]: greenInput,
    [compoundsColors.purple.key]: purpleInput,
    [compoundsColors.apricot.key]: apricotInput
  };

  const currentCompoundClass = useSelector(state => state.previewReducers.compounds.currentCompoundClass);
  const canLoadMoreCompounds = useSelector(state => getCanLoadMoreCompounds(state));
  const currentVector = useSelector(state => state.selectionReducers.currentVector);
  const currentCompounds = useSelector(state => state.previewReducers.compounds.currentCompounds);
  const compoundsListOffset = useSelector(state => getCompoundListOffset(state));

  let headerMessage = currentCompounds.length + ' Compounds on vector to pick';
  if (currentVector === null) {
    headerMessage = 'Not selected vector';
  }

  return (
    <Panel hasHeader title={headerMessage} ref={panelRef}>
      {currentCompounds && (
        <Box height={height} width="100%">
          <Grid container direction="row" justify="space-between" alignItems="center">
            {Object.keys(compoundsColors).map(item => (
              <Grid item key={item}>
                <TextField
                  id={`${item}`}
                  key={`CLASS_${item}`}
                  variant="standard"
                  className={classNames(
                    classes.textField,
                    classes[item],
                    currentCompoundClass === item && classes.selectedInput
                  )}
                  label={compoundsColors[item].text}
                  onChange={e => dispatch(onChangeCompoundClassValue(e))}
                  onKeyDown={e => dispatch(onKeyDownCompoundClass(e))}
                  value={inputs[item] || ''}
                />
              </Grid>
            ))}
          </Grid>
          <Grid container justify="flex-start" className={classes.infinityContainer}>
            <Box width="inherit" style={{ height: `calc(${height} - 114px)` }} overflow="auto">
              <InfiniteScroll
                pageStart={0}
                loadMore={() => dispatch(loadNextPageOfCompounds())}
                hasMore={canLoadMoreCompounds}
                loader={
                  <div className="loader" key={`loader_${0}`}>
                    <div className={classes.paddingProgress}>
                      <CircularProgress />
                    </div>
                  </div>
                }
                useWindow={false}
              >
                {currentCompounds.slice(0, compoundsListOffset).map((data, index) => {
                  return <CompoundView key={index} height={100} width={100} data={data} index={index} />;
                })}
              </InfiniteScroll>
            </Box>
          </Grid>
          <Button color="primary" onClick={() => dispatch(selectAllCompounds())} startIcon={<SelectAll />}>
            Select All
          </Button>
          <Button
            color="primary"
            onClick={() => dispatch(clearAllSelectedCompounds(majorViewStage))}
            startIcon={<Delete />}
          >
            Clear Selection
          </Button>
        </Box>
      )}
    </Panel>
  );
});
