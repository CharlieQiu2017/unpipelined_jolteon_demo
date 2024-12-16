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

function createMsgVert (sender, receiver, msg, net_st) {
  if (sender == receiver) return;

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
         .on ("end", function () {
           msgCirc.remove ();
           if (receiver != 3) net_st.node_states[receiver].handleMsg (msg);
         });
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

function leader_at (r) {
  return (r % 4);
}

class message {
  constructor (type, nid, r, content, embedded) {
    /* 12 types of messages are defined
       type = 0: ECacheVote, content is log_time
       type = 1: MCacheVote, content is user-submitted data
       type = 2: CCacheVote, content is 0
       type = 3: ECacheCert, content is log_time, and embedded is a list of ECacheVote
       type = 4: MCacheCert, content is user-submitted data, and embedded is a list of MCacheVote
       type = 5: CCacheCert, content is 0, and embedded is a list of CCacheVote
       type = 6: TimeoutVote, content is 0, and embedded is a list containing a single MCacheCert or []
       type = 7: TimeoutCert, content is log_time, and embedded is a list of TimeoutVote
       type = 8: CommitCert, content is 0, and embedded is a list containing a single CCacheCert
       type = 9: PullReq, content is log_time, and embedded is a list containing either a single TimeoutCert, or a single CommitCert
       type = 10: InvokeReq, content is user-submitted data, and embedded is a single ECacheCert
       type = 11: PushReq, content is 0, and embedded is a list containing a single MCacheCert
       If embedded is not defined above, it is an empty list
     */
    this.type = type;
    this.nid = nid; /* nid is sender of msg */
    this.r = r; /* r is the round a message belongs to */
    this.content = content; /* depends on msg type, see above */
    this.embedded = embedded; /* a list of msgs, depends on msg type, see above */

    /* We manage a linked-list of undelivered msgs
       It has to be an linked-list because the user may choose to deliver a message at any given time
     */
    this.prev_undeliv_msg = null;
    this.next_undeliv_msg = null;
  }
}

class leader_phase {
  constructor (type, msg) {
    /* 8 leader phases are defined
       type = 0: NotLeader, msg is null
       type = 1: Elected, msg is either a TimeoutCert or a CommitCert
       type = 2: PullWait, msg is a PullReq
       type = 3: Pulled, msg is an ECacheCert
       type = 4: InvokeWait, msg is an InvokeReq
       type = 5: Invoked, msg is an InvokeCert
       type = 6: PushWait, msg is a PushReq
       type = 7: Pushed, msg is a CCacheCert
     */
    this.type = type;
    this.msg = msg;
  }
}

class honest_node {
  constructor () {
    this.round = 1;
    this.leader_phase = new leader_phase (0, null);
    /* 5 voter phases are defined
       type = 0: NoVote
       type = 1: PullVoted
       type = 2: InvokeVoted
       type = 3: PushVoted
       type = 4: Done
     */
    this.voter_phase = 0;
    this.commit_round = 0;
    this.recv_votes = [];
    this.recv_ecaches = [];
    this.recv_mcaches = [];
    this.recv_timeouts = [];
    for (let i = 0; i < 4; ++i) {
      this.recv_votes[i] = null;
      this.recv_ecaches[i] = null;
      this.recv_mcaches[i] = null;
      this.recv_timeouts[i] = null;
    }
    /* Next value to propose when this node becomes leader */
    this.client_data = 0;
  }

  handleMsg (msg) {
  }
}

class net_state {
  constructor () {
    this.node_states = [];
    /* Only create node state for honest nodes */
    for (let i = 0; i < 3; ++i) this.node_states[i] = new honest_node ();
    this.msgs = [];
    this.undeliv_msg_list = null;
  }

  addMsg (msg) {
    this.msgs.push (msg);
    msg.next_undeliv_msg = this.undeliv_msg_list;
    if (this.undeliv_msg_list !== null) {
      this.undeliv_msg_list.prev_undeliv_msg = msg;
    }
    this.undeliv_msg_list = msg;
  }

  delivMsgOne (msg, receiver) {
    createMsgVert (msg.nid, receiver, msg);
  }

  delivMsgAll (msg) {
    if (msg.type == 6 || msg.type >= 9) {
      for (let i = 0; i < 4; ++i) createMsgVert (msg.nid, i, msg);
    } else if (msg.type <= 2) {
      createMsgVert (msg,nid, leader_at (msg.r), msg);
    } else if (msg.type == 7 || msg.type == 8) {
      createMsgVert (msg,nid, leader_at (msg.r + 1), msg);
    }
    if (msg.next_undeliv_msg !== null) {
      msg.next_undeliv_msg.prev_undeliv_msg = msg.prev_undeliv_msg;
    }
    if (msg.prev_undeliv_msg !== null) {
      msg.prev_undeliv_msg.next_undeliv_msg = msg.next_undeliv_msg;
    } else {
      this.undeliv_msg_list = msg.next_undeliv_msg;
    }
    msg.prev_undeliv_msg = null;
    msg.next_undeliv_msg = null;
  }
}
