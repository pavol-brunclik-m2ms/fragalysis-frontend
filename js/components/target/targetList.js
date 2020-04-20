/**
 * Created by abradley on 13/03/2018.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import { ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { List, ListItem, Panel } from '../common';
import { Link } from 'react-router-dom';
import { URLS } from '../routes/constants';

const TargetList = memo(({ target_id_list }) => {
  const render_method = data => {
    const preview = URLS.target + data.title;
    const sgcUrl = 'https://thesgc.org/sites/default/files/XChem/' + data.title + '/html/index.html';
    const sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];

    return (
      <ListItem key={data.id}>
        <Link to={preview}>
          <ListItemText primary={data.title} />
        </Link>
        {sgcUploaded.includes(data.title) && (
          <ListItemSecondaryAction>
            <a href={sgcUrl} target="new">
              Open SGC summary
            </a>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );
  };

  if (target_id_list) {
    return (
      <Panel hasHeader title="Target List">
        <List>{target_id_list.map(data => render_method(data))}</List>
      </Panel>
    );
  } else {
    return <h1>FILL ME UP PLEASE</h1>;
  }
});

function mapStateToProps(state) {
  return {
    target_id_list: state.apiReducers.target_id_list
  };
}
export default connect(mapStateToProps, null)(TargetList);
