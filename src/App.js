import { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionMode
} from "reactflow";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

import "reactflow/dist/style.css";

import TextUpdaterNode from "./TextUpdaterNode.js";
import DownloadButton from "./DownloadButton";

import "./text-updater-node.css";

const rfStyle = {
  backgroundColor: "#12465f"
};

//have to set the IDs of the HTML elements INSIDE of each node
let nodeid = 0;
var ids = ["toplevel" + nodeid, "nodelbl" + nodeid, "lbl" + nodeid];
const updateIDs = () => {
  nodeid++;
  ids = ["toplevel" + nodeid, "nodelbl" + nodeid, "lbl" + nodeid];
};

let numnodes = 0;
let xcoords = [143, 155, 145, 24, -76, -135, -89, 21];
let ycoords = [-76, 13, 115, 132, 109, 3, -90, -107];

var edge_list = [];
var node_list = [];

//helper functions to give each node an ID # and position

let id = 1;
const getId = () => `${id++}`;

const getxpos = () => {
  let indx = numnodes % 8;
  return xcoords[indx];
};

const getypos = () => {
  let indx = numnodes % 8;
  return ycoords[indx];
};

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { textUpdater: TextUpdaterNode };

function Flow() {
  const [thisState, setState] = useState();

  //starting to connect the edges, need to get the ID of the node
  const createEdge = (oldid, newid) => {
    const newedge = {
      id: "e" + oldid + "-" + newid,
      source: oldid,
      target: newid,
      sourceHandle: "a",
      targetHandle: "b",
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    };
    edge_list.push(newedge); //need to read what the edges are in TextUpdaterNode
    return newedge;
  };

  const createNode = (old) => {
    updateIDs(); //next node that is created gets new HTML id names
    const eyed = getId();
    const xposition = Number(getxpos());
    const yposition = Number(getypos());

    var text_label = "";

    if (old === "0") {
      //add to the number of child nodes
      numnodes += 1;
      text_label = "New Subject";
    } else {
      text_label = "New Task";
    }

    const newnode = {
      id: eyed,
      type: "textUpdater",
      position: { x: xposition, y: yposition },
      data: { label: text_label, value: [combineNodeEdge, ids, edge_list] }
    };

    node_list.push(newnode);

    return newnode;
  };

  const combineNodeEdge = (oldid) => {
    var thisnode = createNode(oldid);
    //this is to ensure only 8 child nodes are made
    if (numnodes > 8 && oldid === "0") {
      alert("Sorry, a maximum of 8 child nodes can be created.");
      return;
    } else if (oldid !== "0") {
      let old_element = getNodeWithID(oldid);

      if (old_element.position.x > 0) {
        //place task node to the right
        thisnode.position.x = old_element.position.x + 100;
        thisnode.position.y = old_element.position.y;
      } else {
        //place task node to the left
        thisnode.position.x = old_element.position.x - 100;
        thisnode.position.y = old_element.position.y;
      }
    }

    var thisedge = createEdge(oldid, thisnode.id);

    setNodes((nds) => nds.concat(thisnode));
    setEdges((eds) =>
      eds.concat({
        id: thisedge.id,
        source: thisedge.source,
        target: thisedge.target,
        sourceHandle: thisedge.sourceHandle,
        targetHandle: thisedge.targetHandle,
        markerEnd: thisedge.markerEnd
      })
    );

    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node) => {
          return node;
        })
      );

      setEdges((eds) =>
        eds.map((edge) => {
          return edge;
        })
      );
    }, 1);
  };

  const initialNodes = [
    {
      id: "0",
      type: "textUpdater",
      position: { x: 0, y: 0 },
      data: { label: "Brain Map", value: [combineNodeEdge, ids, edge_list] },
      deletable: false
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const getNodeWithID = (nodeID) => {
    let oldelement = node_list.find((x) => x.id === nodeID);
    console.log(thisState);
    return oldelement;
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div className="wrapper">
      <DownloadButton />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={rfStyle}
        connectionMode={ConnectionMode.Loose}
      />
      <div className="tool btn btn-primary tooltip">
        <FontAwesomeIcon icon={faCircleQuestion} className="qmark" />
        <div class="top">
          <h3>Welcome to Brain Map!</h3>
          <p>
            Hi, I'm Iyanna Buffaloe and this is a webpage that I designed using
            react and reactflow to visually map data.
          </p>
          <h3>How it Works</h3>
          <p>
            Hover on the main "Brain Map" node and click the plus button to add
            more ideas to your graph.
            <p>
              {" "}
              Pressing any node (except the main circle) and hitting "backspace"
              will delete it.{" "}
            </p>
          </p>
          <p>
            Clicking plus on these nodes will create sub-nodes, or "sub-tasks".
          </p>
          <p>Double click on the title of any node to change the name.</p>
          <p>Click and drag any node to move it around. Happy Mapping! </p>
        </div>
      </div>
    </div>
  );
}

export default Flow;
