/**
 * Created by ricgillams on 04/02/2019.
 */
import {Row, Well} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import FragspectView from "./fragspectView";

class FragspectList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLECULE;
        this.state = {
            confidenceState: [
                {1: "low"},
                {2: "medium"},
                {3: "high"}
                ],
            depositionStatus: [
                {0: "PanDDA"},
                {1: "In Refinement"},
                {2: "Refined"},
                {3: "CompChem Ready"},
                {4: "Deposition ready"},
                {5: "Deposited"}
                ],
            fragspectObjects: [
                {
                    "fragId": 49,
                    "code": "NUDT7A_Crude-x0005_1",
                    "lig_id": "LIG-D1",
                    "target_id": 5,
                    "prot_id": 8657,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "deposition_status": 3,
                    "confidence": 3,
                    "resolution": 2.1,
                    "smiles": "O=C(O)c1ccc(Cl)c(Cl)c1",
                    "space_group": "C 1 2 1",
                    "cell_dimensions": "102, 45, 60",
                    "cell_angles": "90. 90, 90"
                },
                {
                    "frag_id": 50,
                    "code": "NUDT7A_Crude-x1232_1",
                    "lig_id": "LIG-D1",
                    "target_id": 5,
                    "prot_id": 8657,
                    "event_map_info": "media/maps/MURD-x0349_acceptor_ebBZqDc.ccp4",
                    "spider_plot_info": "media/spideys/MURD-x0349_acceptor_ebBZqDc.png",
                    "pandda_model_found": true,
                    "deposition_status": 4,
                    "confidence": 2,
                    "resolution": 1.5,
                    "smiles": "O=C(Nc1cccnc1)c1ccccc1F",
                    "space_group": "C 1 2 1",
                    "cell_dimensions": "102, 45, 60",
                    "cell_angles": "90, 90, 90"
                },
            ]
        };
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }

    render() {
        return <Well>
            <Row>
                <Col xs={2} md={2}><p>Crystal ID</p></Col>
                <Col xs={2} md={2}><p>Structure</p></Col>
                <Col xs={2} md={2}><p>XChem status</p></Col>
                <Col xs={1} md={1}><p>Resolution</p></Col>
                <Col xs={2} md={2}><p>Confidence</p></Col>
                <Col xs={1} md={1}><p>SPG / dimensions</p></Col>
                <Col xs={2} md={2}><p>Misc</p></Col>
            </Row>
            <Row>
                {this.state.fragspectObjects.map((data) => <FragspectView key={data.code} data={data}/>)}
            </Row>
        </Well>;
    }
}
function mapStateToProps(state) {
  return {
      object_list: state.apiReducers.present.molecule_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setMoleculeList,
}

export default connect(mapStateToProps, mapDispatchToProps)(FragspectList);
