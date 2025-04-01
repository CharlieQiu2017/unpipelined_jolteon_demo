import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const width = 1500;
const height = 600;
const marginTop = 80;
const marginRight = 1000;
const marginBottom = 40;
const marginLeft = 20;
const detailTextX = 650;
const detailTextY = 150;

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
let node_labels = [];

node_labels[0] =
  svg.append ("text")
     .attr ("x", marginLeft)
     .attr ("y", marginTop - 20)
     .attr ("font-size", 25)
     .text ("Node 1 (honest)");

node_labels[1] =
  svg.append ("text")
     .attr ("x", width - marginRight - 2 * nodeSize)
     .attr ("y", marginTop - 20)
     .attr ("font-size", 25)
     .text ("Node 2 (honest)");

node_labels[2] =
  svg.append ("text")
     .attr ("x", marginLeft)
     .attr ("y", height - marginBottom + 35)
     .attr ("font-size", 25)
     .text ("Node 3 (honest)");

node_labels[3] =
  svg.append ("text")
     .attr ("x", width - marginRight - 2 * nodeSize)
     .attr ("y", height - marginBottom + 35)
     .attr ("font-size", 25)
     .text ("Node 4 (byzantine)");

/* Text box for showing node and msg details */
const detailText =
  svg.append ("text")
     .text ("Click on a node label or an in-transit message to see its details here")
     .attr ("x", detailTextX)
     .attr ("y", detailTextY)
     .attr ("font-size", 18);

function voterPhaseToString (p) {
  if (p === 0) {
    return "Waiting for Pull request";
  } else if (p === 1) {
    return "Voted for Pull request, waiting for Invoke request";
  } else if (p === 2) {
    return "Voted for Invoke request, waiting for Push request";
  } else if (p === 3) {
    return "Voted for Push request";
  } else if (p === 4) {
    return "Local timer expired, waiting for TimeoutCert";
  }
}

function leaderPhaseToString (p) {
  if (p.type === 0) {
    return "Not leader in current round";
  } else if (p.type === 2) {
    return "Pull request sent, waiting for votes";
  } else if (p.type === 4) {
    return "Invoke request sent, waiting for votes";
  } else if (p.type === 6) {
    return "Push request sent, waiting for votes";
  } else if (p.type === 7) {
    return "Proposal committed, waiting to enter next round";
  }
}

for (let i = 0; i < 3; ++i) {
  node_labels[i].style ("cursor", "pointer");
  node_labels[i].on ("click", function () {
    let st = global_net_st.node_states[i];
    detailText.text ("");
    detailText.append ("tspan")
              .text ("Internal state of node " + String (i + 1));
    detailText.append ("tspan")
              .attr ("x", detailTextX)
              .attr ("dy", 25)
              .text ("Round: " + String (st.round));
    detailText.append ("tspan")
              .attr ("x", detailTextX)
              .attr ("dy", 25)
              .text ("Phase as voter: " + voterPhaseToString (st.voter_phase));
    detailText.append ("tspan")
              .attr ("x", detailTextX)
              .attr ("dy", 25)
              .text ("Phase as leader: " + leaderPhaseToString (st.leader_phase));
    detailText.append ("tspan")
              .attr ("x", detailTextX)
              .attr ("dy", 25)
              .text ("Local timer remaining time: " + getLocalTimerTime (i));
  });
}

node_labels[3].style ("cursor", "pointer");
node_labels[3].on ("click", function () {
  detailText.text ("This is the byzantine node. It has no internal state.");
});

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

const delta = 1000;
const latency = 10;

let simulationPaused = false;

let msg_group = svg.append ("g");

function msgGetType (msg) {
  if (msg.type === 0) {
    return "ECacheVote";
  } else if (msg.type === 1) {
    return "MCacheVote";
  } else if (msg.type === 2) {
    return "CCacheVote";
  } else if (msg.type === 3) {
    return "ECacheCert";
  } else if (msg.type === 4) {
    return "MCacheCert";
  } else if (msg.type === 5) {
    return "CCacheCert";
  } else if (msg.type === 6) {
    return "TimeoutVote";
  } else if (msg.type === 7) {
    return "TimeoutCert";
  } else if (msg.type === 8) {
    return "CommitCert";
  } else if (msg.type === 9) {
    return "PullReq";
  } else if (msg.type === 10) {
    return "InvokeReq";
  } else if (msg.type === 11) {
    return "PushReq";
  }
}

function createMsgVert (sender, receiver, msg, net_st) {
  if (sender === receiver) return;

  let start_cx = coords[links[sender * 4 + receiver][0]][0],
      start_cy = coords[links[sender * 4 + receiver][0]][1],
      end_cx = coords[links[sender * 4 + receiver][1]][0],
      end_cy = coords[links[sender * 4 + receiver][1]][1];

  const msgCirc = msg_group.append ("circle")
			   .attr ("cx", start_cx)
			   .attr ("cy", start_cy)
			   .attr ("r", 10)
			   .attr ("fill", "orange")
			   .attr ("T", 0)
			   .attr ("dst_cx", end_cx)
			   .attr ("dst_cy", end_cy)
			   .style ("cursor", "pointer");

  msgCirc.on ("click", function () {
    detailText.text ("");
    detailText.append ("tspan")
	      .text ("Selected message:");
    detailText.append ("tspan")
	      .attr ("x", detailTextX)
	      .attr ("dy", 25)
	      .text ("Type: " + msgGetType (msg));
    detailText.append ("tspan")
	      .attr ("x", detailTextX)
	      .attr ("dy", 25)
	      .text ("Sender: Node " + String (msg.nid + 1));
    detailText.append ("tspan")
	      .attr ("x", detailTextX)
	      .attr ("dy", 25)
	      .text ("Round: " + String (msg.r));
    detailText.append ("tspan")
	      .attr ("x", detailTextX)
	      .attr ("dy", 25)
	      .text ("Content: " + String (msg.content));
    detailText.append ("tspan")
	      .attr ("x", detailTextX)
	      .attr ("dy", 25)
	      .text ("Semantically valid: " + (msg.validate () ? "True" : "False"));
  });

  msgCirc.node ().endFunc = function () {
    msgCirc.remove ();
    if (receiver != 3 && msg.validate ()) {
      let {new_msgs, timer_reset} = net_st.node_states[receiver].handleMsgLoop (msg);
      for (let i = 0; i < new_msgs.length; ++i) net_st.addMsg (new_msgs[i]);
      if (timer_reset && net_st.gst) { resetTimer (receiver, net_st); }
    }
  };

  if (! simulationPaused) {
    msgCirc.transition ()
           .duration (delta)
           .ease (d3.easeLinear)
           .attr ("cx", end_cx)
           .attr ("cy", end_cy)
           .attrTween ("T", function () { return function (t) { return Math.round (t * delta) } })
           .on ("end", msgCirc.node ().endFunc);
  }
}

function pauseMsgs () {
  msg_group.selectAll ("circle").interrupt ();
}

function resumeMsgs () {
  msg_group.selectAll ("circle")
           .interrupt ()
           .transition ()
           .ease (d3.easeLinear)
           .duration (function () { return delta - parseInt (this.getAttribute ("T")) })
           .attr ("cx", function () { return parseInt (this.getAttribute ("dst_cx")) })
           .attr ("cy", function () { return parseInt (this.getAttribute ("dst_cy")) })
           .attrTween ("T", function () {
		let rem_time = delta - parseInt (this.getAttribute ("T"));
		return function (t) { return delta - rem_time + Math.round (t * rem_time) }
	   })
           .on ("end", function () { this.endFunc() });
}

/* For each honest node we create an arc representing the timer */

let arc_centers = [
  [marginLeft + nodeSize + 75, marginTop + nodeSize - 35],
  [width - marginRight - nodeSize + 75, marginTop + nodeSize - 35],
  [marginLeft + nodeSize + 75, height - marginBottom - nodeSize - 35]
];

let arc = d3.arc ();
let arcs = [];

for (let i = 0; i < 3; ++i) {
  arcs.push (svg.append ("path")
		.attr ("fill", "red")
		.attr ("transform", "translate(" + arc_centers[i][0] + "," + arc_centers[i][1] + ")")
		.attr ("d", arc ({ startAngle: 0, endAngle: 0, innerRadius: 21, outerRadius: 24 }))
		.attr ("T", 0)
		.attr ("running", "false")
	    );
}

function getLocalTimerTime (i) {
  if (! global_net_st.gst) return "Local timer not running (commence GST to enable local timers)";
  if (arcs[i].attr ("running") === "false") return "Local timer expired";
  return String ((10000 - arcs[i].attr ("T")) / 1000);
}

function resetTimer (node, net_st) {
  arcs[node].interrupt ();

  arcs[node].node ().endFunc = function () {
    arcs[node].attr ("running", "false");
    let timeout = net_st.node_states[node].doTimeout ();
    net_st.addMsg (timeout);
    let {new_msgs, timer_reset} = net_st.node_states[node].handleMsgLoop (timeout);
    for (let i = 0; i < new_msgs.length; ++i) net_st.addMsg (new_msgs[i]);
    if (timer_reset && net_st.gst) resetTimer (node, net_st);
  }

  arcs[node].attr ("running", "true");

  if (! simulationPaused) {
    arcs[node].transition ()
	      .duration (delta * latency)
	      .ease (d3.easeLinear)
	      .attrTween ("d", function () { return function (t) { return arc ({ startAngle: 0, endAngle: 2 * Math.PI * (1 - t), innerRadius: 21, outerRadius: 24 }) }} )
	      .attrTween ("T", function () { return function (t) { return Math.round (t * delta * latency) } })
	      .on ("end", arcs[node].node ().endFunc);
  }
}

function pauseTimers () {
  for (let i = 0; i < 3; ++i) arcs[i].interrupt ();
}

function resumeTimers () {
  for (let i = 0; i < 3; ++i) {
    if (arcs[i].attr ("running") === "true") {
      arcs[i].interrupt ();
      arcs[i].transition ()
	     .duration (function () { return delta * latency - parseInt (this.getAttribute ("T")) })
	     .ease (d3.easeLinear)
	     .attrTween ("d", function () {
		let rem_time = delta * latency - parseInt (this.getAttribute ("T"));
		return function (t) { return arc ({ startAngle: 0, endAngle: 2 * Math.PI * (1 - t) * rem_time / (delta * latency), innerRadius: 21, outerRadius: 24 }) }
	     })
	     .attrTween ("T", function () {
		let rem_time = delta * latency - parseInt (this.getAttribute ("T"));
		return function (t) { return delta * latency - rem_time + Math.round (t * rem_time) }
	     })
	     .on ("end", arcs[i].node ().endFunc);
    }
  }
}

const svg_block =
      d3.create ("div")
        .style ("margin-bottom", "50px")
        .style ("line-height", "0px");

svg_block.node ().append (svg.node ());
container.append (svg_block.node ());

const pauseIndicator =
      d3.create ("div")
        .text ("Animation is currently running")
        .style ("margin-bottom", "20px")
        .classed ("main", true);

const pauseButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .classed ("main", true)
        .text ("Pause animation")
        .on ("click", function () { simulationPaused = true; pauseMsgs (); pauseTimers (); pauseIndicator.text ("Animation is currently paused"); });

const resumeButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .classed ("main", true)
        .text ("Resume animation")
        .on ("click", function () { simulationPaused = false; resumeMsgs(); resumeTimers (); pauseIndicator.text ("Animation is currently running"); });

const console_tabs_div = d3.create ("div").classed ("tab", true);

const sendMsgButton =
      d3.create ("button")
        .attr ("type", "button")
        .classed ("tablinks", true)
        .text ("Deliver an existing message");

const createMsgButton =
      d3.create ("button")
        .attr ("type", "button")
        .classed ("tablinks", true)
        .text ("Create a byzantine node message");

const timeoutButton =
      d3.create ("button")
        .attr ("type", "button")
        .classed ("tablinks", true)
        .text ("Deliver a timeout signal to an honest node");

const setValButton =
      d3.create ("button")
        .attr ("type", "button")
        .classed ("tablinks", true)
        .text ("Set the next value to be proposed by an honest node");

const gstButton =
      d3.create ("button")
        .attr ("type", "button")
        .classed ("tablinks", true)
        .text ("Commence global synchronization (GST)");

const lidoButton =
      d3.create ("button")
        .attr ("type", "button")
        .classed ("tablinks", true)
        .text ("LiDO Cache Tree");

let sendMsgConsole = d3.create ("div").classed ("tabcontent", true);
let createMsgConsole = d3.create ("div").classed ("tabcontent", true);
let timeoutConsole = d3.create ("div").classed ("tabcontent", true);
let setValConsole = d3.create ("div").classed ("tabcontent", true);
let gstConsole = d3.create ("div").classed ("tabcontent", true);
let lidoConsole = d3.create ("div").classed ("tabcontent", true);

sendMsgButton.on ("click", function () {
  sendMsgButton.classed ("active", true);
  createMsgButton.classed ("active", false);
  timeoutButton.classed ("active", false);
  setValButton.classed ("active", false);
  gstButton.classed ("active", false);
  lidoButton.classed ("active", false);

  sendMsgConsole.style ("display", "block");
  createMsgConsole.style ("display", "none");
  timeoutConsole.style ("display", "none");
  setValConsole.style ("display", "none");
  gstConsole.style ("display", "none");
  lidoConsole.style ("display", "none");

  window.scrollTo(0, document.body.scrollHeight);
});

createMsgButton.on ("click", function () {
  sendMsgButton.classed ("active", false);
  createMsgButton.classed ("active", true);
  timeoutButton.classed ("active", false);
  setValButton.classed ("active", false);
  gstButton.classed ("active", false);
  lidoButton.classed ("active", false);

  sendMsgConsole.style ("display", "none");
  createMsgConsole.style ("display", "block");
  timeoutConsole.style ("display", "none");
  setValConsole.style ("display", "none");
  gstConsole.style ("display", "none");
  lidoConsole.style ("display", "none");

  window.scrollTo(0, document.body.scrollHeight);
});

timeoutButton.on ("click", function () {
  sendMsgButton.classed ("active", false);
  createMsgButton.classed ("active", false);
  timeoutButton.classed ("active", true);
  setValButton.classed ("active", false);
  gstButton.classed ("active", false);
  lidoButton.classed ("active", false);

  sendMsgConsole.style ("display", "none");
  createMsgConsole.style ("display", "none");
  timeoutConsole.style ("display", "block");
  setValConsole.style ("display", "none");
  gstConsole.style ("display", "none");
  lidoConsole.style ("display", "none");

  window.scrollTo(0, document.body.scrollHeight);
});

setValButton.on ("click", function () {
  sendMsgButton.classed ("active", false);
  createMsgButton.classed ("active", false);
  timeoutButton.classed ("active", false);
  setValButton.classed ("active", true);
  gstButton.classed ("active", false);
  lidoButton.classed ("active", false);

  sendMsgConsole.style ("display", "none");
  createMsgConsole.style ("display", "none");
  timeoutConsole.style ("display", "none");
  setValConsole.style ("display", "block");
  gstConsole.style ("display", "none");
  lidoConsole.style ("display", "none");

  window.scrollTo(0, document.body.scrollHeight);
});

gstButton.on ("click", function () {
  sendMsgButton.classed ("active", false);
  createMsgButton.classed ("active", false);
  timeoutButton.classed ("active", false);
  setValButton.classed ("active", false);
  gstButton.classed ("active", true);
  lidoButton.classed ("active", false);

  sendMsgConsole.style ("display", "none");
  createMsgConsole.style ("display", "none");
  timeoutConsole.style ("display", "none");
  setValConsole.style ("display", "none");
  gstConsole.style ("display", "block");
  lidoConsole.style ("display", "none");

  window.scrollTo(0, document.body.scrollHeight);
});

lidoButton.on ("click", function () {
  sendMsgButton.classed ("active", false);
  createMsgButton.classed ("active", false);
  timeoutButton.classed ("active", false);
  setValButton.classed ("active", false);
  gstButton.classed ("active", false);
  lidoButton.classed ("active", true);

  sendMsgConsole.style ("display", "none");
  createMsgConsole.style ("display", "none");
  timeoutConsole.style ("display", "none");
  setValConsole.style ("display", "none");
  gstConsole.style ("display", "none");
  lidoConsole.style ("display", "block");

  window.scrollTo(0, document.body.scrollHeight);
});

container.append (pauseIndicator.node ());
container.append (pauseButton.node ());
container.append (resumeButton.node ());
container.append (console_tabs_div.node ());
console_tabs_div.node ().append (sendMsgButton.node ());
console_tabs_div.node ().append (createMsgButton.node ());
console_tabs_div.node ().append (timeoutButton.node ());
console_tabs_div.node ().append (setValButton.node ());
console_tabs_div.node ().append (gstButton.node ());
console_tabs_div.node ().append (lidoButton.node ());
container.append (sendMsgConsole.node ());
container.append (createMsgConsole.node ());
container.append (timeoutConsole.node ());
container.append (setValConsole.node ());
container.append (gstConsole.node ());
container.append (lidoConsole.node ());

function leader_at (r) {
  return ((r - 1) % 4);
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

  /* Check if message is semantically valid */
  validate () {
    if (this.type < 0 || this.type > 11) return false;
    if (this.nid < 0 || this.nid > 3) return false;
    if (this.r <= 0) return false;
    if (this.type === 0) {
      return (this.content >= 0 && this.content < this.r && this.embedded.length === 0);
    } else if (this.type === 1) {
      return (this.embedded.length === 0);
    } else if (this.type === 2) {
      return (this.content === 0 && this.embedded.length === 0);
    } else if (this.type >= 3 && this.type <= 5) {
      if (this.nid != leader_at (this.r)) return false;
      if (this.type === 5 && this.content !== 0) return false;
      let voted = [false, false, false, false];
      for (let i = 0; i < this.embedded.length; ++i) {
	let m = this.embedded[i];
	if (! m.validate ()) return false;
	if (m.type !== this.type - 3 || m.r !== this.r || m.content !== this.content) return false;
	voted[m.nid] = true;
      }
      let vote_count = 0;
      for (let i = 0; i < 4; ++i) { if (voted[i]) ++vote_count; }
      if (vote_count < 3) return false; else return true;
    } else if (this.type === 6) {
      if (this.content !== 0) return false;
      if (this.embedded.length >= 2) return false;
      if (this.embedded.length === 0) return true;
      let m = this.embedded[0];
      if (m.type !== 4 || m.r > this.r) return false;
      return true;
    } else if (this.type === 7) {
      if (this.content > this.r) return false;
      let voted = [false, false, false, false];
      let found = false;
      for (let i = 0; i < this.embedded.length; ++i) {
	let m = this.embedded[i];
	if (! m.validate ()) return false;
	if (m.type !== 6 || m.r < this.r) return false;
	let m_r = 0;
        if (m.embedded.length > 0) m_r = m.embedded[0].r;
        if (m_r > this.content) return false; else if (m_r === this.content) found = true;
	voted[m.nid] = true;
      }
      if (! found) return false;
      let vote_count = 0;
      for (let i = 0; i < 4; ++i) { if (voted[i]) ++vote_count; }
      if (vote_count < 3) return false; else return true;
    } else if (this.type === 8) {
      if (this.content !== 0) return false;
      if (this.embedded.length !== 1) return false;
      let m = this.embedded[0];
      if (! m.validate ()) return false;
      if (m.type !== 5) return false;
      if (m.r !== this.r) return false;
      return true;
    } else if (this.type === 9) {
      if (this.nid !== leader_at (this.r)) return false;
      if (this.embedded.length !== 1) return false;
      let m = this.embedded[0];
      if (! m.validate ()) return false;
      if (m.r !== this.r - 1) return false;
      if (m.type === 7) {
	return (this.content === m.content);
      } else if (m.type === 8) {
	return (this.content === this.r - 1);
      } else return false;
    } else if (this.type === 10) {
      if (this.nid !== leader_at (this.r)) return false;
      if (this.embedded.length !== 1) return false;
      let m = this.embedded[0];
      if (! m.validate ()) return false;
      if (m.r !== this.r) return false;
      if (m.type !== 3) return false;
      return true;
    } else if (this.type === 11) {
      if (this.nid !== leader_at (this.r)) return false;
      if (this.embedded.length !== 1) return false;
      let m = this.embedded[0];
      if (! m.validate ()) return false;
      if (m.r !== this.r) return false;
      if (m.type !== 4) return false;
      return true;
    }
  }

  embeddedToString () {
    if (this.embedded.length === 0) return "[]";
    let str = "[";
    for (let i = 0; i < this.embedded.length - 1; ++i) {
      str += this.embedded[i].toString ();
      str += ", ";
    }
    str += this.embedded[this.embedded.length - 1].toString ();
    str += "]";
    return str;
  }

  toString () {
    if (this.type === 0) {
      return "ECacheVote(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.content.toString () + ")";
    } else if (this.type === 1) {
      return "MCacheVote(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.content.toString () + ")";
    } else if (this.type === 2) {
      return "CCacheVote(" + (this.nid + 1).toString () + ", " + this.r.toString () + ")";
    } else if (this.type === 3) {
      return "ECacheCert(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.content.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 4) {
      return "MCacheCert(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.content.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 5) {
      return "CCacheCert(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 6) {
      return "TimeoutVote(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 7) {
      return "TimeoutCert(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.content.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 8) {
      return "CommitCert(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 9) {
      return "PullReq(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.content.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 10) {
      return "InvokeReq(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.content.toString () + ", " + this.embeddedToString () + ")";
    } else if (this.type === 11) {
      return "PushReq(" + (this.nid + 1).toString () + ", " + this.r.toString () + ", " + this.embeddedToString () + ")";
    }
    return "Internal error";
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
  constructor (id) {
    this.id = id;
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
      this.recv_timeouts[i] = null;
    }
    /* Next value to propose when this node becomes leader */
    this.client_data = 0;

    /* Flag for whether QC has been sent for current round, to prevent repetition */
    this.qc_sent = false;
    /* Max round for which a TC has been sent, to prevent repetition */
    this.max_tc_sent = 0;
  }

  canBuildCache () {
    let count = 0;
    for (let i = 0; i < 4; ++i) {
      if (this.recv_votes[i] !== null) ++count;
    }
    return count >= 3;
  }

  canBuildTC () {
    let count = 0;
    for (let i = 0; i < 4; ++i) {
      if (this.recv_timeouts[i] !== null && this.recv_timeouts[i].type === 6 && this.recv_timeouts[i].r >= this.round) ++count;
    }
    return count >= 3;
  }

  canPull () { return this.leader_phase.type === 1; }
  canInvoke () { return this.leader_phase.type === 3; }
  canPush () { return this.leader_phase.type === 5; }
  canBuildQC () { return (! this.qc_sent) && this.leader_phase.type === 7; }

  doBuildCache (new_msgs) {
    if (this.leader_phase.type === 2 && this.leader_phase.msg.type === 9) {
      let votes = [];
      for (let i = 0; i < 4; ++i) {
	if (this.recv_votes[i] !== null) votes.push (this.recv_votes[i]);
      }
      let cert = new message (3, this.id, this.leader_phase.msg.r, this.leader_phase.msg.content, votes);
      this.leader_phase.type = 3;
      this.leader_phase.msg = cert;
      for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
      new_msgs.push (cert);
    } else if (this.leader_phase.type === 4 && this.leader_phase.msg.type === 10) {
      let votes = [];
      for (let i = 0; i < 4; ++i) {
	if (this.recv_votes[i] !== null) votes.push (this.recv_votes[i]);
      }
      let cert = new message (4, this.id, this.leader_phase.msg.r, this.leader_phase.msg.content, votes);
      this.leader_phase.type = 5;
      this.leader_phase.msg = cert;
      for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
      new_msgs.push (cert);
    } else if (this.leader_phase.type === 6 && this.leader_phase.msg.type === 11) {
      let votes = [];
      for (let i = 0; i < 4; ++i) {
	if (this.recv_votes[i] !== null) votes.push (this.recv_votes[i]);
      }
      let cert = new message (5, this.id, this.leader_phase.msg.r, 0, votes);
      this.leader_phase.type = 7;
      this.leader_phase.msg = cert;
      for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
      new_msgs.push (cert);
    }
  }

  doBuildTC (new_msgs) {
    /* Find the maximum round for which we can build a TC */
    let max_r = this.round;
    let test = true;
    while (test) {
      max_r++;
      let count = 0;
      for (let i = 0; i < 4; ++i) {
	if (this.recv_timeouts[i] !== null && this.recv_timeouts[i].type === 6) {
	  let timeout_log_time = 0;
	  if (this.recv_timeouts[i].embedded.length > 0 && this.recv_timeouts[i].embedded[0].type === 4) {
	    timeout_log_time = this.recv_timeouts[i].embedded[0].r;
	  }
	  if (this.recv_timeouts[i].r >= max_r && timeout_log_time <= max_r) ++count;
	}
      }
      if (count < 3) test = false;
    }

    /* When loop exits, test = false, and the max round we can build TC is max_r - 1 */
    max_r--;
    if (max_r <= this.max_tc_sent) return;
    this.max_tc_sent = max_r;

    let timeouts = [];
    let log_time = 0;
    for (let i = 0; i < 4; ++i) {
      if (this.recv_timeouts[i] !== null && this.recv_timeouts[i].type === 6) {
	let timeout_log_time = 0;
	if (this.recv_timeouts[i].embedded.length > 0 && this.recv_timeouts[i].embedded[0].type === 4) {
	  timeout_log_time = this.recv_timeouts[i].embedded[0].r;
	}
	if (this.recv_timeouts[i].r >= max_r && timeout_log_time <= max_r) {
	  timeouts.push (this.recv_timeouts[i]);
	  if (timeout_log_time > log_time) log_time = timeout_log_time;
	}
      }
    }

    let tc = new message (7, this.id, max_r, log_time, timeouts);
    new_msgs.push (tc);
  }

  doPull (new_msgs) {
    if (this.leader_phase.type === 1 && (this.leader_phase.msg.type === 7 || this.leader_phase.msg.type === 8)) {
      let log_time = 0;
      if (this.leader_phase.msg.type === 7) log_time = this.leader_phase.msg.content; else log_time = this.leader_phase.msg.r;
      let req = new message (9, this.id, this.round, log_time, [this.leader_phase.msg]);
      this.leader_phase.type = 2;
      this.leader_phase.msg = req;
      new_msgs.push (req);
    }
  }

  doInvoke (new_msgs) {
    if (this.leader_phase.type === 3 && this.leader_phase.msg.type === 3) {
      let req = new message (10, this.id, this.round, this.client_data, [this.leader_phase.msg]);
      this.leader_phase.type = 4;
      this.leader_phase.msg = req;
      new_msgs.push (req);
    }
  }

  doPush (new_msgs) {
    if (this.leader_phase.type === 5 && this.leader_phase.msg.type === 4) {
      let req = new message (11, this.id, this.round, 0, [this.leader_phase.msg]);
      this.leader_phase.type = 6;
      this.leader_phase.msg = req;
      new_msgs.push (req);
    }
  }

  doBuildQC (new_msgs) {
    if (this.leader_phase.type === 7 && this.leader_phase.msg.type === 5) {
      new_msgs.push (new message (8, this.id, this.round, 0, [this.leader_phase.msg]));
      this.qc_sent = true;
    }
  }

  doTimeout () {
    this.voter_phase = 4;
    let mc = [];
    if (this.commit_round > 0) mc.push (this.recv_mcaches[this.commit_round]);
    return new message (6, this.id, this.round, 0, mc);
  }

  /* Returns a list of new messages to send */
  handleMsg (msg) {
    let new_msgs = [];

    if (msg.type === 0) { /* ECacheVote */
      if (this.leader_phase.type === 2 && this.leader_phase.msg.type === 9) {
	if (this.leader_phase.msg.r === msg.r && this.leader_phase.msg.content === msg.content) {
	  this.recv_votes[msg.nid] = msg;
	}
      }
    } else if (msg.type === 1) { /* MCacheVote */
      if (this.leader_phase.type === 4 && this.leader_phase.msg.type === 10) {
	if (this.leader_phase.msg.r === msg.r && this.leader_phase.msg.content === msg.content) {
	  this.recv_votes[msg.nid] = msg;
	}
      }
    } else if (msg.type === 2) { /* CCacheVote */
      if (this.leader_phase.type === 6 && this.leader_phase.msg.type === 11) {
	if (this.leader_phase.msg.r === msg.r) {
	  this.recv_votes[msg.nid] = msg;
	}
      }
    } else if (msg.type === 6) { /* Timeout */
      let timeout_log_time = 0;
      if (msg.embedded.length > 0 && msg.embedded[0].type === 4) {
	timeout_log_time = msg.embedded[0].r;
      }
      if (this.recv_timeouts[msg.nid] === null || (this.recv_timeouts[msg.nid].type === 6 && this.recv_timeouts[msg.nid].r < msg.r)) {
	this.recv_timeouts[msg.nid] = msg;
	if (this.round < timeout_log_time) {
	  this.round = timeout_log_time;
	  this.leader_phase.type = 0;
	  this.leader_phase.msg = null;
	  this.voter_phase = 0;
	  for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
	  this.qc_sent = false;
	}
      }
    } else if (msg.type === 7 || msg.type === 8) { /* TimeoutCert, CommitCert */
      if (this.round <= msg.r) {
	this.round = msg.r + 1;
	if (this.id === leader_at (msg.r + 1)) {
	  this.leader_phase.type = 1;
	  this.leader_phase.msg = msg;
	} else {
	  this.leader_phase.type = 0;
	  this.leader_phase.msg = null;
	}
	this.voter_phase = 0;
	for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
	this.qc_sent = false;

	if (msg.nid !== this.id && this.id !== leader_at (msg.r + 1)) {
	  let forward_tc = new message (msg.type, this.id, msg.r, msg.content, msg.embedded);
	  new_msgs.push (forward_tc);
	}
      }
    } else if (msg.type === 9) { /* PullReq */
      if (this.round < msg.r) {
	this.round = msg.r;
	this.leader_phase.type = 0;
	this.leader_phase.msg = null;
	this.voter_phase = 1;
	this.qc_sent = false;
	for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
	if (msg.embedded.length > 0 && msg.embedded[0].type === 7) {
	  if (msg.embedded[0].content > 0) {
	    for (let i = 0; i < msg.embedded[0].embedded.length; ++i) {
	      if (msg.embedded[0].embedded[i].type === 6 &&
		  msg.embedded[0].embedded[i].embedded.length > 0 &&
		  msg.embedded[0].embedded[i].embedded[0].type === 4 &&
		  msg.embedded[0].embedded[i].embedded[0].r === msg.embedded[0].content) {
		this.recv_mcaches[msg.embedded[0].content] = msg.embedded[0].embedded[i].embedded[0];
	      }
	    }
	  }
	}
	let vote = new message (0, this.id, msg.r, msg.content, []);
	new_msgs.push (vote);
      } else if (this.round === msg.r && this.voter_phase === 0) {
	this.voter_phase = 1;
	if (msg.embedded.length > 0 && msg.embedded[0].type === 7) {
	  if (msg.embedded[0].content > 0) {
	    for (let i = 0; i < msg.embedded[0].embedded.length; ++i) {
	      if (msg.embedded[0].embedded[i].type === 6 &&
		  msg.embedded[0].embedded[i].embedded.length > 0 &&
		  msg.embedded[0].embedded[i].embedded[0].type === 4 &&
		  msg.embedded[0].embedded[i].embedded[0].r === msg.embedded[0].content) {
		this.recv_mcaches[msg.embedded[0].content] = msg.embedded[0].embedded[i].embedded[0];
	      }
	    }
	  }
	}
	let vote = new message (0, this.id, msg.r, msg.content, []);
	new_msgs.push (vote);
      }
    } else if (msg.type === 10) { /* InvokeReq */
      if (this.round < msg.r) {
	this.round = msg.r;
	this.leader_phase.type = 0;
	this.leader_phase.msg = null;
	this.voter_phase = 2;
	this.qc_sent = false;
	for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
	if (msg.embedded.length > 0 && msg.embedded[0].type === 3) {
	  this.recv_ecaches[msg.r] = msg.embedded[0];
	}
	let vote = new message (1, this.id, msg.r, msg.content, []);
	new_msgs.push (vote);
      } else if (this.round === msg.r && this.voter_phase >= 0 && this.voter_phase <= 1) {
	this.voter_phase = 2;
	if (msg.embedded.length > 0 && msg.embedded[0].type === 3) {
	  this.recv_ecaches[msg.r] = msg.embedded[0];
	}
	let vote = new message (1, this.id, msg.r, msg.content, []);
	new_msgs.push (vote);
      }
    } else if (msg.type === 11) { /* PushReq */
      if (this.round < msg.r) {
	this.round = msg.r;
	this.leader_phase.type = 0;
	this.leader_phase.msg = null;
	this.voter_phase = 3;
	this.commit_round = msg.r;
	this.qc_sent = false;
	for (let i = 0; i < 4; ++i) this.recv_votes[i] = null;
	if (msg.embedded.length > 0 && msg.embedded[0].type === 4) {
	  this.recv_mcaches[msg.r] = msg.embedded[0];
	}
	let vote = new message (2, this.id, msg.r, 0, []);
	new_msgs.push (vote);
      } else if (this.round === msg.r && this.voter_phase >= 0 && this.voter_phase <= 2) {
	this.voter_phase = 3;
	this.commit_round = msg.r;
	if (msg.embedded.length > 0 && msg.embedded[0].type === 4) {
	  this.recv_mcaches[msg.r] = msg.embedded[0];
	}
	let vote = new message (2, this.id, msg.r, 0, []);
	new_msgs.push (vote);
      }
    }

    if (this.canBuildCache ()) { this.doBuildCache (new_msgs); }
    if (this.canPull ()) { this.doPull (new_msgs); }
    if (this.canInvoke ()) { this.doInvoke (new_msgs); }
    if (this.canPush ()) { this.doPush (new_msgs); }
    if (this.canBuildQC ()) { this.doBuildQC (new_msgs); }
    if (this.canBuildTC ()) { this.doBuildTC (new_msgs); }

    return new_msgs;
  }

  /* Handling one message may cause the process to send out more messages,
     and if the process itself is a recipient of the new message, then its
     handler must be invoked immediately. Hence use a loop to process new
     messages until no new message needs to be delivered to oneself.
   */
  handleMsgLoop (msg) {
    let old_round = this.round, new_round = 0;

    let msg_queue = [msg], curr_idx = 0;
    let new_msgs = [];

    while (curr_idx < msg_queue.length) {
      let new_msg_tmp = this.handleMsg (msg_queue[curr_idx]);
      curr_idx++;
      for (let i = 0; i < new_msg_tmp.length; ++i) {
	new_msgs.push (new_msg_tmp[i]);
	if (new_msg_tmp[i].type >= 6 && new_msg_tmp[i].type <= 11) msg_queue.push (new_msg_tmp[i]);
	if (new_msg_tmp[i].type >= 0 && new_msg_tmp[i].type <= 2 && this.id === leader_at (new_msg_tmp[i].r)) msg_queue.push (new_msg_tmp[i]);
      }
    }

    new_round = this.round;
    return {
      new_msgs: new_msgs,
      timer_reset : new_round > old_round
    }
  }
}

class net_state {
  constructor () {
    this.node_states = [];
    /* Only create node state for honest nodes */
    for (let i = 0; i < 3; ++i) this.node_states[i] = new honest_node (i);
    this.msgs = [];
    this.undeliv_msg_list = null;

    /* Message list for the "deliver chosen message" console */
    this.dom_msg_list1 = null;
    /* Message list for the "build byzantine message" console */
    this.dom_msg_list2 = null;

    this.gst = false;
  }

  addMsg (msg) {
    this.msgs.push (msg);
    if (this.dom_msg_list1 !== null) {
      this.dom_msg_list1.append ("option").text (msg.toString ());
    }
    if (this.dom_msg_list2 !== null) {
      this.dom_msg_list2.append ("option").text (msg.toString ());
    }

    if ((msg.type >= 0 && msg.type <= 2) || (msg.type >= 6 && msg.type <= 11)) {
      msg.next_undeliv_msg = this.undeliv_msg_list;
      if (this.undeliv_msg_list !== null) {
	this.undeliv_msg_list.prev_undeliv_msg = msg;
      }
      this.undeliv_msg_list = msg;
      if (this.gst) this.delivMsgAll (msg);
    }

    if (msg.type >= 3 && msg.type <= 5 && msg.r <= 5 && msg.validate ()) {
      if (msg.type === 3) addECache (msg.r, msg.content);
      else if (msg.type === 4) addMCache (msg.r, msg.content);
      else if (msg.type === 5) addCCache (msg.r);
    }
  }

  delivMsgOne (msg, receiver) {
    createMsgVert (msg.nid, receiver, msg, this);
  }

  delivMsgAll (msg) {
    if (msg.type === 6 || msg.type >= 9) {
      for (let i = 0; i < 4; ++i) createMsgVert (msg.nid, i, msg, this);
    } else if (msg.type <= 2) {
      createMsgVert (msg.nid, leader_at (msg.r), msg, this);
    } else if (msg.type === 7 || msg.type === 8) {
      createMsgVert (msg.nid, leader_at (msg.r + 1), msg, this);
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

let global_net_st = new net_state ();
document.global_net_st = global_net_st;

/* sendMsgConsole */
let sendMsgSelect = d3.create ("select").style ("height", "40px").style ("width", "1000px").style ("font-size", "18px");
global_net_st.dom_msg_list1 = sendMsgSelect.append ("optgroup").style ("font-size", "18px");
global_net_st.dom_msg_list1.append ("option").text ("-- Select a message to send --");
let sendMsgDstSelect = d3.create ("select").style ("height", "40px").style ("font-size", "18px");
sendMsgDstSelect.append ("option").text ("Deliver to node 1");
sendMsgDstSelect.append ("option").text ("Deliver to node 2");
sendMsgDstSelect.append ("option").text ("Deliver to node 3");
sendMsgDstSelect.append ("option").text ("Deliver to all recipients");
let sendMsgCompleteButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Send chosen message")
        .on ("click", function () {
	  let idx = sendMsgSelect.node ().selectedIndex;
	  let dstIdx = sendMsgDstSelect.node ().selectedIndex;
	  if (idx === 0) {
	    alert ("Please choose a valid message");
	  } else {
	    if (dstIdx === 3) {
	      global_net_st.delivMsgAll (global_net_st.msgs[idx - 1]);
	    } else {
	      global_net_st.delivMsgOne (global_net_st.msgs[idx - 1], dstIdx);
	    }
	  }
        });

sendMsgConsole.node ().append (sendMsgSelect.node ());
sendMsgConsole.node ().append (sendMsgDstSelect.node ());
sendMsgConsole.node ().append (sendMsgCompleteButton.node ());

/* createMsgConsole */
let crtMsgSelect = d3.create ("select").style ("height", "40px").style ("font-size", "18px");
crtMsgSelect.append ("option").text ("ECacheVote");
crtMsgSelect.append ("option").text ("MCacheVote");
crtMsgSelect.append ("option").text ("CCacheVote");
crtMsgSelect.append ("option").text ("ECacheCert");
crtMsgSelect.append ("option").text ("MCacheCert");
crtMsgSelect.append ("option").text ("CCacheCert");
crtMsgSelect.append ("option").text ("TimeoutVote");
crtMsgSelect.append ("option").text ("TimeoutCert");
crtMsgSelect.append ("option").text ("CommitCert");
crtMsgSelect.append ("option").text ("PullReq");
crtMsgSelect.append ("option").text ("InvokeReq");
crtMsgSelect.append ("option").text ("PushReq");

let crtMsgRoundTextbox =
    d3.create ("input")
      .attr ("type", "text")
      .style ("font-size", "18px")
      .attr ("name", "crtMsgRound")
      .attr ("value", "1");
let crtMsgRoundLabel =
    d3.create ("label")
      .style ("font-size", "18px")
      .attr ("for", "crtMsgRound")
      .text ("Round Number");
let crtMsgContentTextbox =
    d3.create ("input")
      .attr ("type", "text")
      .style ("font-size", "18px")
      .attr ("name", "crtMsgContent")
      .attr ("value", "0");
let crtMsgContentLabel =
    d3.create ("label")
      .style ("font-size", "18px")
      .attr ("for", "crtMsgContent")
      .text ("Message Content");
let crtMsgEmbedTextbox =
    d3.create ("input")
      .attr ("type", "text")
      .property ("disabled", true)
      .style ("font-size", "18px")
      .attr ("name", "crtMsgEmbed")
      .attr ("value", "");
let crtMsgEmbedLabel =
    d3.create ("label")
      .style ("font-size", "18px")
      .attr ("for", "crtMsgEmbed")
      .text ("Embedded messages");
let crtMsgEmbedList = [];
let embedMsgSelect = d3.create ("select").style ("height", "40px").style ("width", "1000px").style ("font-size", "18px");
global_net_st.dom_msg_list2 = embedMsgSelect.append ("optgroup").style ("font-size", "18px");
global_net_st.dom_msg_list2.append ("option").text ("-- Select a message to embed --");
let crtMsgAddEmbedButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Add selected message to embedded message list")
        .on ("click", function () {
	  let idx = embedMsgSelect.node ().selectedIndex;
	  if (idx === 0) {
	    alert ("Please select a valid message to embed");
	    return;
	  }
	  crtMsgEmbedList.push (global_net_st.msgs[idx - 1]);
	  let curr_val = crtMsgEmbedTextbox.attr ("value");
	  crtMsgEmbedTextbox.attr ("value", curr_val + String (idx - 1) + ",");
        });
let crtMsgClearEmbedButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Clear list of embedded messages")
        .on ("click", function () {
	  crtMsgEmbedList = [];
	  crtMsgEmbedTextbox.attr ("value", "");
        });
let crtMsgCompleteButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Inject constructed message into the network")
        .on ("click", function () {
	  let m_type = crtMsgSelect.node ().selectedIndex;
	  let m_nid = 3;
	  let m_r = parseInt (crtMsgRoundTextbox.node ().value);
	  let m_content = parseInt (crtMsgContentTextbox.node ().value);
	  let m_embedded = [...crtMsgEmbedList];
	  let msg = new message (m_type, m_nid, m_r, m_content, m_embedded);
	  if (! msg.validate ()) {
	    if (! window.confirm ("Constructed message is not semantically valid. Still inject this message? (Semantically invalid messages are silently ignored by honest nodes)")) return;
	  }
	  global_net_st.addMsg (msg);
        });

createMsgConsole.node ().append (crtMsgSelect.node ());
createMsgConsole.node ().append (crtMsgRoundLabel.node ());
createMsgConsole.node ().append (crtMsgRoundTextbox.node ());
createMsgConsole.node ().append (crtMsgContentLabel.node ());
createMsgConsole.node ().append (crtMsgContentTextbox.node ());
createMsgConsole.node ().append (crtMsgEmbedLabel.node ());
createMsgConsole.node ().append (crtMsgEmbedTextbox.node ());
createMsgConsole.node ().append (embedMsgSelect.node ());
createMsgConsole.node ().append (crtMsgAddEmbedButton.node ());
createMsgConsole.node ().append (crtMsgClearEmbedButton.node ());
createMsgConsole.node ().append (crtMsgCompleteButton.node ());

/* timeoutConsole */
let timeoutSelect = d3.create ("select").style ("height", "40px").style ("font-size", "18px");
timeoutSelect.append ("option").text ("Node 1");
timeoutSelect.append ("option").text ("Node 2");
timeoutSelect.append ("option").text ("Node 3");

let timeoutCompleteButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Deliver timeout to chosen node")
        .on ("click", function () {
	  if (global_net_st.gst) {
	    alert ("Timeout signals cannot be delivered manually after GST");
	    return;
	  }
	  let idx = timeoutSelect.node ().selectedIndex;
	  let timeout = global_net_st.node_states[idx].doTimeout ();
	  global_net_st.addMsg (timeout);
	  let {new_msgs, timer_reset} = global_net_st.node_states[idx].handleMsgLoop (timeout);
	  for (let i = 0; i < new_msgs.length; ++i) global_net_st.addMsg (new_msgs[i]);
	  if (timer_reset && global_net_st.gst) resetTimer (idx, global_net_st);
        });

timeoutConsole.node ().append (timeoutSelect.node ());
timeoutConsole.node ().append (timeoutCompleteButton.node ());

/* setValConsole */
let setValSelect = d3.create ("select").style ("height", "40px").style ("font-size", "18px");
setValSelect.append ("option").text ("Node 1");
setValSelect.append ("option").text ("Node 2");
setValSelect.append ("option").text ("Node 3");

let setValTextbox =
    d3.create ("input")
      .attr ("type", "text")
      .style ("font-size", "18px")
      .attr ("value", "0");

let setValCompleteButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Set proposal for chosen node")
        .on ("click", function () {
	  let v = parseInt (setValTextbox.node ().value, 10);
	  let idx = setValSelect.node ().selectedIndex;
	  global_net_st.node_states[idx].client_data = v;
        });

setValConsole.node ().append (setValSelect.node ());
setValConsole.node ().append (setValTextbox.node ());
setValConsole.node ().append (setValCompleteButton.node ());

/* gstConsole */
let gstIndicator =
      d3.create ("div")
        .text ("GST is currently not in effect")
        .style ("margin-bottom", "20px")
        .classed ("main", true);

let gstCompleteButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Commence GST")
        .on ("click", function () {
	  if (global_net_st.gst) return;
	  global_net_st.gst = true;
	  gstIndicator.text ("GST is currently in effect");

	  /* Deliver all undelivered msgs */
	  let m = global_net_st.undeliv_msg_list;
	  while (m !== null) {
	    let m_next = m.next_undeliv_msg;
	    global_net_st.delivMsgAll (m);
	    m = m_next;
	  }

	  /* Reset all timers */
	  for (let i = 0; i < 3; ++i) resetTimer (i, global_net_st);
        });

let gstStopButton =
      d3.create ("button")
        .attr ("type", "button")
        .style ("display", "block")
        .style ("font-size", "18px")
        .text ("Stop GST")
        .on ("click", function () {
	  if (! global_net_st.gst) return;
	  global_net_st.gst = false;
	  gstIndicator.text ("GST is currently not in effect");

	  /* Stop all timers */
	  for (let i = 0; i < 3; ++i) {
	    arcs[i].interrupt ();
	    arcs[i].attr ("d", arc ({ startAngle: 0, endAngle: 0, innerRadius: 21, outerRadius: 24 }))
		   .attr ("T", 0)
		   .attr ("running", "false")
	  }
        });

gstConsole.node ().append (gstIndicator.node ());
gstConsole.node ().append (gstCompleteButton.node ());
gstConsole.node ().append (gstStopButton.node ());

/* lidoConsole */
lidoConsole.append ("div").text ("Only cache nodes for the first 5 rounds are shown.");
let lidoGraph = lidoConsole.append ("svg").attr ("width", 1400).attr ("height", 650);

/* Columns */
lidoGraph.append ("text")
         .attr ("x", 350)
         .attr ("y", 120)
         .attr ("font-size", 18)
         .attr ("text-anchor", "middle")
         .text ("Pull (ECache)");
lidoGraph.append ("text")
         .attr ("x", 650)
         .attr ("y", 120)
         .attr ("font-size", 18)
         .attr ("text-anchor", "middle")
         .text ("Invoke (MCache)");
lidoGraph.append ("text")
         .attr ("x", 950)
         .attr ("y", 120)
         .attr ("font-size", 18)
         .attr ("text-anchor", "middle")
         .text ("Push (CCache)");

/* Rows */
for (let i = 1; i <= 5; ++i) {
  lidoGraph.append ("text")
	   .attr ("x", 50)
	   .attr ("y", 100 + 100 * i)
	   .attr ("font-size", 18)
	   .attr ("dominant-baseline", "middle")
	   .text ("Round " + String (i));
}

/* Root cache node */
lidoGraph.append ("rect")
         .attr ("x", 150)
         .attr ("y", 20)
         .attr ("width", 110)
         .attr ("height", 50)
         .attr ("fill", "none")
         .attr ("stroke", "black")
         .attr ("stroke-width", 1);

lidoGraph.append ("text")
    .attr ("x", 205)
    .attr ("y", 45)
    .attr ("font-size", 18)
    .attr ("text-anchor", "middle")
    .attr ("dominant-baseline", "middle")
    .text ("Root");

const ecache_path = "M 0 30 L 40 0 L 140 0 L 180 30 L 140 60 L 40 60 L 0 30";
const ccache_path = "M 0 0 L 180 0 L 180 60 L 0 60 L 0 0";

let ecache_dom = [];
let mcache_dom = [];
let ccache_dom = [];
let ecache_text = [];
let mcache_text = [];
let ccache_text = [];
let ecache_arrow = [];
let mcache_arrow = [];
let ccache_arrow = [];

/* https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/marker */
let marker = lidoGraph.append ("marker")
    .attr ("id", "arrow")
    .attr ("viewBox", "0 0 16 16")
    .attr ("refX", 8)
    .attr ("refY", 8)
    .attr ("markerWidth", 12)
    .attr ("markerHeight", 12)
    .attr ("orient", "auto-start-reverse");
marker.append ("path")
    .attr ("d", "M 0 0 L 16 8 L 0 16 z");

for (let i = 1; i <= 5; ++i) {
  /* ECache */
  ecache_dom[i] =
  lidoGraph.append ("path")
	   .attr ("d", ecache_path)
	   .attr ("fill", "none")
	   .attr ("stroke", "black")
	   .attr ("stroke-width", 1)
	   .attr ("stroke-dasharray", "7 5")
	   .attr ("transform", "translate(260," + String (70 + 100 * i) + ")");

  ecache_text[i] =
  lidoGraph.append ("text")
	   .attr ("x", 350)
	   .attr ("y", 100 + 100 * i)
	   .attr ("text-anchor", "middle")
	   .attr ("dominant-baseline", "middle")
	   .text ("Not created yet");

  ecache_arrow[i] = null;

  /* MCache */
  mcache_dom[i] =
  lidoGraph.append ("ellipse")
	   .attr ("rx", 90)
	   .attr ("ry", 30)
	   .attr ("cx", 650)
	   .attr ("cy", 100 + 100 * i)
	   .attr ("fill", "none")
	   .attr ("stroke", "black")
	   .attr ("stroke-width", 1)
	   .attr ("stroke-dasharray", "7 5");

  mcache_text[i] =
  lidoGraph.append ("text")
	   .attr ("x", 650)
	   .attr ("y", 100 + 100 * i)
	   .attr ("text-anchor", "middle")
	   .attr ("dominant-baseline", "middle")
	   .text ("Not created yet");

  mcache_arrow[i] = null;

  /* CCache */
  ccache_dom[i] =
  lidoGraph.append ("path")
	   .attr ("d", ccache_path)
	   .attr ("fill", "none")
	   .attr ("stroke", "black")
	   .attr ("stroke-width", 1)
	   .attr ("stroke-dasharray", "7 5")
	   .attr ("transform", "translate(860," + String (70 + 100 * i) + ")");

  ccache_text[i] =
  lidoGraph.append ("text")
	   .attr ("x", 950)
	   .attr ("y", 100 + 100 * i)
	   .attr ("text-anchor", "middle")
	   .attr ("dominant-baseline", "middle")
	   .text ("Not created yet");

  ccache_arrow[i] = null;
}

function addECache (r, pr) {
  if (r <= 0 || r > 5) return;
  ecache_dom[r].attr ("stroke-dasharray", null);
  ecache_text[r].text ("Parent Round = " + String (pr));

  /* Arrow */
  if (ecache_arrow[r] === null) {
    if (pr === 0) {
      ecache_arrow[r] = lidoGraph.append ("path")
	    .attr ("d", "M 260 " + String (100 + r * 100) + " L " + String (150 + r * 10) + " " + String (100 + r * 100) + " L " + String (150 + r * 10) + " 70")
	    .attr ("fill", "none")
	    .attr ("stroke", "black")
	    .attr ("stroke-width", 1)
	    .attr ("marker-end", "url(#arrow)");
    } else {
      ecache_arrow[r] = lidoGraph.append ("path")
	    .attr ("d", "M 260 " + String (100 + r * 100) + " L " + String (150 + r * 10) + " " + String (100 + r * 100) + " L " + String (150 + r * 10) + " " + String (150 + pr * 100) + " L 650 " + String (150 + pr * 100) + " L 650 " + String (130 + pr * 100))
	    .attr ("fill", "none")
	    .attr ("stroke", "black")
	    .attr ("stroke-width", 1)
	    .attr ("marker-end", "url(#arrow)");
    }
  }
}

function addMCache (r, m) {
  if (r <= 0 || r > 5) return;
  mcache_dom[r].attr ("stroke-dasharray", null);
  mcache_text[r].text ("Req Method = " + String (m));

  /* Arrow */
  if (mcache_arrow[r] === null) {
    mcache_arrow[r] = lidoGraph.append ("path")
	  .attr ("d", "M 560 " + String (100 + r * 100) + " L 440 " + String (100 + r * 100))
	  .attr ("stroke", "black")
	  .attr ("stroke-width", 1)
	  .attr ("marker-end", "url(#arrow)");
  }
}

function addCCache (r) {
  if (r <= 0 || r > 5) return;
  ccache_dom[r].attr ("stroke-dasharray", null);
  ccache_text[r].text ("Committed");

  if (ccache_arrow[r] === null) {
    ccache_arrow[r] = lidoGraph.append ("path")
	  .attr ("d", "M 860 " + String (100 + r * 100) + " L 740 " + String (100 + r * 100))
	  .attr ("stroke", "black")
	  .attr ("stroke-width", 1)
	  .attr ("marker-end", "url(#arrow)");
  }
}
