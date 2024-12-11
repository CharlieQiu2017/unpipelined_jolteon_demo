import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const width = 650;
const height = 600;
const marginTop = 80;
const marginRight = 150;
const marginBottom = 40;
const marginLeft = 20;

const svg = d3.create ("svg")
              .attr ("width", width)
              .attr ("height", height);

const nodeSize = 50;

/* Icons for the 3f+1 nodes */
svg.append ("circle")
   .attr ("cx", marginLeft + nodeSize)
   .attr ("cy", marginTop + nodeSize)
   .attr ("r", nodeSize)
   .attr ("fill", "none")
   .attr ("stroke", "black");

svg.append ("circle")
   .attr ("cx", width - marginRight - nodeSize)
   .attr ("cy", marginTop + nodeSize)
   .attr ("r", nodeSize)
   .attr ("fill", "none")
   .attr ("stroke", "black");

svg.append ("circle")
   .attr ("cx", marginLeft + nodeSize)
   .attr ("cy", height - marginBottom - nodeSize)
   .attr ("r", nodeSize)
   .attr ("fill", "none")
   .attr ("stroke", "black");

svg.append ("circle")
   .attr ("cx", width - marginRight - nodeSize)
   .attr ("cy", height - marginBottom - nodeSize)
   .attr ("r", nodeSize)
   .attr ("fill", "none")
   .attr ("stroke", "black");

/* Text labels for the nodes */
/* TODO: Show node state upon clicking the labels */

svg.append ("text")
   .attr ("x", marginLeft)
   .attr ("y", marginTop - 20)
   .attr ("font-size", 25)
   .text ("Node 1 (honest)");

svg.append ("text")
   .attr ("x", width - marginRight - 2 * nodeSize)
   .attr ("y", marginTop - 20)
   .attr ("font-size", 25)
   .text ("Node 2 (honest)");

svg.append ("text")
   .attr ("x", marginLeft)
   .attr ("y", height - marginBottom + 35)
   .attr ("font-size", 25)
   .text ("Node 3 (honest)");

svg.append ("text")
   .attr ("x", width - marginRight - 2 * nodeSize)
   .attr ("y", height - marginBottom + 35)
   .attr ("font-size", 25)
   .text ("Node 4 (byzantine)");

/* Coordinates of anchor points on each node circle */
const coords =
      [[marginLeft + 2 * nodeSize, marginTop + nodeSize],
       [marginLeft + nodeSize, marginTop + 2 * nodeSize],
       [marginLeft + 1.70711 * nodeSize, marginTop + 1.70711 * nodeSize],
       [width - marginRight - 2 * nodeSize, marginTop + nodeSize],
       [width - marginRight - nodeSize, marginTop + 2 * nodeSize],
       [width - marginRight - 1.70711 * nodeSize, marginTop + 1.70711 * nodeSize],
       [marginLeft + 2 * nodeSize, height - marginBottom - nodeSize],
       [marginLeft + nodeSize, height - marginBottom - 2 * nodeSize],
       [marginLeft + 1.70711 * nodeSize, height - marginBottom - 1.70711 * nodeSize],
       [width - marginRight - 2 * nodeSize, height - marginBottom - nodeSize],
       [width - marginRight - nodeSize, height - marginBottom - 2 * nodeSize],
       [width - marginRight - 1.70711 * nodeSize, height - marginBottom - 1.70711 * nodeSize]];

const links =
      [[0, 0],
       [0, 3],
       [1, 7],
       [2, 11],

       [3, 0],
       [0, 0],
       [5, 8],
       [4, 10],

       [7, 1],
       [8, 5],
       [0, 0],
       [6, 9],

       [11, 2],
       [10, 4],
       [9, 6],
       [0, 0]];

/* Lines connecting nodes */
/* Dashed lines represent asynchronous links;
   Solid lines represent synchronous links.
 */

for (let i = 0; i < 4; ++i) {
  for (let j = i + 1; j < 4; ++j) {
    svg.append ("line")
       .attr ("x1", coords[links[i * 4 + j][0]][0])
       .attr ("y1", coords[links[i * 4 + j][0]][1])
       .attr ("x2", coords[links[i * 4 + j][1]][0])
       .attr ("y2", coords[links[i * 4 + j][1]][1])
       .style ("stroke", "black")
       .style ("stroke-dasharray", "35,10");
  }
}

function createMsgVert (sender, receiver, msg) {
  let start_cx = coords[links[sender * 4 + receiver][0]][0], 
      start_cy = coords[links[sender * 4 + receiver][0]][1],
      end_cx = coords[links[sender * 4 + receiver][1]][0],
      end_cy = coords[links[sender * 4 + receiver][1]][1];

  const msgCirc = svg.append ("circle")
                     .attr ("cx", start_cx)
                     .attr ("cy", start_cy)
                     .attr ("r", 10)
                     .attr ("fill", "orange");

  msgCirc.transition ()
         .duration (1000)
         .attr ("cx", end_cx)
         .attr ("cy", end_cy)
         .on ("end", function () { msgCirc.remove (); });
}

const svg_block =
      d3.create ("div")
        .style ("margin-bottom", "50px")
        .style ("line-height", "0px");

svg_block.node ().append (svg.node ());
container.append (svg_block.node ());

const sendMsgButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .text ("Deliver an existing message");

const createMsgButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .text ("Create a byzantine node message");

const timeoutButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .text ("Deliver a timeout signal to an honest node");

const setValButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .text ("Set the next value to be proposed by an honest node");

const gstButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .text ("Commence global synchronization (GST)");

container.append (sendMsgButton.node ());
container.append (createMsgButton.node ());
container.append (timeoutButton.node ());
container.append (setValButton.node ());
container.append (gstButton.node ());
