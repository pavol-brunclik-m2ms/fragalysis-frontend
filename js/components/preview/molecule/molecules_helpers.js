import { OBJECT_TYPE } from '../../nglView/constants';

export const generateMolecule = (id, sdf_info) => {
  return {
    name: OBJECT_TYPE.MOLECULE + '_' + id + '_LIGAND',
    OBJECT_TYPE: OBJECT_TYPE.MOLECULE,
    colour: '#FFFFFF',
    sdf_info: sdf_info
  };
};

const base_url = window.location.protocol + '//' + window.location.host;

// TODO unify names!
const complexNameByType = {
  contacts: code => code + '_CONTACTS',
  protein: code => code + '_PROTEIN',
  surface: code => code + '_SURFACE'
};

const complexObjectByType = {
  contacts: OBJECT_TYPE.COMPLEX,
  protein: OBJECT_TYPE.PROTEIN,
  surface: OBJECT_TYPE.SURFACE
};

export const generateComplex = (id, protein_code, sdf_info, molecule_protein, type = 'contacts') => {
  return {
    name: complexNameByType[type](protein_code),
    OBJECT_TYPE: complexObjectByType[type],
    sdf_info: sdf_info,
    colour: '#FFFFFF',
    prot_url: base_url + molecule_protein
  };
};

export const generateSphere = (data, selected = false) => {
  var colour = [0, 0, 1];
  var radius;
  if (data.mol_id.length > 10) {
    radius = 6.0;
  } else if (data.mol_id.length > 5) {
    radius = 4.0;
  } else {
    radius = 2.0;
  }
  if (selected) {
    colour = [0, 1, 0];
  }
  // Move this out of this
  return {
    OBJECT_TYPE: OBJECT_TYPE.SPHERE,
    name: OBJECT_TYPE.MOLECULE_GROUP + '_' + +data.id.toString(),
    radius: radius,
    colour: colour,
    coords: [data.x_com, data.y_com, data.z_com]
  };
};

export const getTotalCountOfCompounds = graph => {
  let tot_num = 0;

  if (graph) {
    Object.keys(graph).forEach(key => {
      tot_num += graph[key].addition ? Object.keys(graph[key].addition).length : 0;
    });
  }
  return tot_num;
};
