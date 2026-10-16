/* =========================================================================
   BFS Algorithm Visualizer — JavaScript
   DAA Assignment 2
   ========================================================================= */

(() => {
  'use strict';

  // ───────── Constants ─────────
  const NODE_RADIUS = 22;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // ───────── State ─────────
  let nodes = [];          // { id, x, y }
  let edges = [];          // { from, to }
  let adjList = {};        // id -> [id, ...]
  let nextNodeId = 0;

  // BFS state
  let bfsSteps = [];       // pre-computed animation steps
  let bfsStepIndex = 0;
  let bfsRunning = false;
  let bfsPaused = false;
  let bfsComplete = false;
  let bfsTimer = null;

  // Interaction state
  let mode = 'drag';       // 'drag' | 'add-node' | 'add-edge'
  let edgeStart = null;    // node id for first click in add-edge mode
  let dragging = null;     // { nodeId, offsetX, offsetY }

  // ───────── DOM References ─────────
  const svg = document.getElementById('graph-svg');
  const edgesGroup = document.getElementById('edges-group');
  const nodesGroup = document.getElementById('nodes-group');
  const startSelect = document.getElementById('start-vertex-select');
  const queueContainer = document.getElementById('queue-container');
  const modeInfo = document.getElementById('canvas-mode-info');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const learningMsg = document.getElementById('learning-message');
  const learningToggle = document.getElementById('learning-toggle');
  const speedSlider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-label');
  const pseudocodeEl = document.getElementById('pseudocode');

  // Buttons
  const btnAddNode = document.getElementById('btn-add-node');
  const btnAddEdge = document.getElementById('btn-add-edge');
  const btnLoadDefault = document.getElementById('btn-load-default');
  const btnRandom = document.getElementById('btn-random-graph');
  const btnClear = document.getElementById('btn-clear-graph');
  const btnStart = document.getElementById('btn-start-bfs');
  const btnPause = document.getElementById('btn-pause-bfs');
  const btnStep = document.getElementById('btn-step-bfs');
  const btnReset = document.getElementById('btn-reset-bfs');

  // Info panel
  const infoCurrent = document.getElementById('info-current');
  const infoStep = document.getElementById('info-step');
  const infoVisited = document.getElementById('info-visited');
  const infoStatus = document.getElementById('info-status');
  const infoTraversal = document.getElementById('info-traversal');

  // ───────── Utility ─────────
  function getSpeed() {
    return parseInt(speedSlider.value, 10);
  }

  function getSvgPoint(e) {
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function findNodeAt(x, y) {
    for (const n of nodes) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS + 4) return n;
    }
    return null;
  }

  function rebuildAdjList() {
    adjList = {};
    for (const n of nodes) adjList[n.id] = [];
    for (const e of edges) {
      adjList[e.from].push(e.to);
      adjList[e.to].push(e.from);
    }
    // Sort neighbours for consistent traversal
    for (const id in adjList) {
      adjList[id].sort((a, b) => a - b);
    }
  }

  function updateStartSelect() {
    const prev = startSelect.value;
    startSelect.innerHTML = '';
    if (nodes.length === 0) {
      startSelect.innerHTML = '<option value="">— add nodes —</option>';
      btnStart.disabled = true;
      btnStep.disabled = true;
      return;
    }
    for (const n of [...nodes].sort((a, b) => a.id - b.id)) {
      const opt = document.createElement('option');
      opt.value = n.id;
      opt.textContent = `Vertex ${n.id}`;
      startSelect.appendChild(opt);
    }
    // Restore previous selection if still valid
    if ([...startSelect.options].some(o => o.value === prev)) {
      startSelect.value = prev;
    }
    btnStart.disabled = bfsRunning && !bfsPaused;
    btnStep.disabled = bfsRunning && !bfsPaused;
  }

  function setStatus(type, text) {
    statusDot.className = `status-dot ${type}`;
    statusText.textContent = text;
  }

  function setLearning(html, active = false) {
    if (!learningMsg) return;
    learningMsg.innerHTML = html;
    if (active) {
      learningMsg.classList.add('active');
    } else {
      learningMsg.classList.remove('active');
    }
  }

  // ───────── Pseudocode Setup ─────────
  let pseudoLineElements = [];

  function setupPseudocode() {
    if (!pseudocodeEl) return;
    const lines = [
      '<span class="function">BFS</span>(Graph, start):',
      '&nbsp;&nbsp;<span class="keyword">visited</span> = {start}',
      '&nbsp;&nbsp;<span class="keyword">queue</span> = [start]',
      '',
      '&nbsp;&nbsp;<span class="keyword">while</span> queue <span class="keyword">is not empty</span>:',
      '&nbsp;&nbsp;&nbsp;&nbsp;vertex = <span class="function">remove_front</span>(queue)',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="function">output</span>(vertex)',
      '',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">for each</span> neighbour <span class="keyword">of</span> vertex:',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">if</span> neighbour <span class="keyword">is not</span> visited:',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="function">mark</span> neighbour as visited',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="function">add</span> neighbour to queue'
    ];

    pseudocodeEl.innerHTML = '';
    pseudoLineElements = [];

    lines.forEach((lineHtml) => {
      const span = document.createElement('span');
      span.className = 'pseudo-line';
      if (lineHtml === '') {
        span.innerHTML = '&nbsp;';
      } else {
        span.innerHTML = lineHtml;
      }
      span.style.display = 'block';
      pseudocodeEl.appendChild(span);
      pseudoLineElements.push(span);
    });
  }

  function highlightPseudocode(stepType) {
    pseudoLineElements.forEach(el => el.classList.remove('highlight-line'));

    if (!stepType) return;

    let targetIndices = [];
    if (stepType === 'init') {
      targetIndices = [1, 2];
    } else if (stepType === 'dequeue') {
      targetIndices = [4, 5, 6];
    } else if (stepType === 'enqueue') {
      targetIndices = [8, 9, 10, 11];
    } else if (stepType === 'no-new') {
      targetIndices = [8];
    } else if (stepType === 'complete') {
      targetIndices = [4];
    }

    targetIndices.forEach(idx => {
      if (pseudoLineElements[idx]) {
        pseudoLineElements[idx].classList.add('highlight-line');
      }
    });
  }

  function highlightAlgoStep(stepNum) {
    for (let i = 1; i <= 6; i++) {
      const li = document.getElementById(`algo-step-${i}`);
      if (!li) continue;
      li.classList.remove('active');
      if (stepNum === 0) {
        li.classList.remove('completed');
      } else if (i < stepNum) {
        li.classList.add('completed');
      } else if (i === stepNum) {
        li.classList.add('active');
        li.classList.remove('completed');
      } else {
        li.classList.remove('completed');
      }
    }
  }

  // ───────── Queue Rendering ─────────
  function renderQueue(queueArr) {
    queueContainer.innerHTML = '';
    if (!queueArr || queueArr.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'queue-empty';
      emptySpan.id = 'queue-empty-msg';
      emptySpan.textContent = 'Queue is empty';
      queueContainer.appendChild(emptySpan);
      return;
    }
    queueArr.forEach((item, index) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'queue-item' + (index === 0 ? ' front' : '');
      qDiv.textContent = item;
      queueContainer.appendChild(qDiv);
    });
  }

  // ───────── Rendering ─────────
  function render() {
    renderEdges();
    renderNodes();
  }

  function renderEdges() {
    edgesGroup.innerHTML = '';
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const from = nodes.find(n => n.id === e.from);
      const to = nodes.find(n => n.id === e.to);
      if (!from || !to) continue;

      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('class', 'edge-line');
      line.setAttribute('data-from', e.from);
      line.setAttribute('data-to', e.to);
      line.id = `edge-${e.from}-${e.to}`;
      edgesGroup.appendChild(line);
    }
  }

  function renderNodes() {
    nodesGroup.innerHTML = '';
    const startId = parseInt(startSelect.value, 10);
    for (const n of nodes) {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'node-group');
      g.setAttribute('data-id', n.id);

      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', n.x);
      circle.setAttribute('cy', n.y);
      circle.setAttribute('r', NODE_RADIUS);
      let circleClass = 'node-circle';
      if (edgeStart === n.id) {
        circleClass += ' selected';
      } else if (n.id === startId && !bfsRunning && !bfsComplete) {
        circleClass += ' start-node';
      }
      circle.setAttribute('class', circleClass);
      circle.id = `node-circle-${n.id}`;

      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', n.x);
      label.setAttribute('y', n.y);
      label.setAttribute('class', 'node-label');
      label.textContent = n.id;

      g.appendChild(circle);
      g.appendChild(label);
      nodesGroup.appendChild(g);
    }
  }

  function updateNodeElementPosition(node) {
    const circle = document.getElementById(`node-circle-${node.id}`);
    if (circle) {
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
    }
    const g = nodesGroup.querySelector(`g[data-id="${node.id}"]`);
    if (g) {
      const label = g.querySelector('text');
      if (label) {
        label.setAttribute('x', node.x);
        label.setAttribute('y', node.y);
      }
    }

    // Update attached edges
    edges.forEach(e => {
      if (e.from === node.id || e.to === node.id) {
        const line = document.getElementById(`edge-${e.from}-${e.to}`);
        if (line) {
          const fromNode = nodes.find(n => n.id === e.from);
          const toNode = nodes.find(n => n.id === e.to);
          if (fromNode && toNode) {
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
          }
        }
      }
    });
  }

  // ───────── Mode Handling ─────────
  function setMode(newMode) {
    if (bfsRunning && !bfsPaused) return;

    if (mode === newMode) {
      mode = 'drag';
    } else {
      mode = newMode;
    }

    if (edgeStart !== null) {
      const prevCircle = document.getElementById(`node-circle-${edgeStart}`);
      if (prevCircle) prevCircle.classList.remove('selected');
      edgeStart = null;
    }

    btnAddNode.classList.toggle('btn-primary', mode === 'add-node');
    btnAddEdge.classList.toggle('btn-primary', mode === 'add-edge');

    if (mode === 'add-node') {
      modeInfo.textContent = 'Mode: Click canvas to add node';
      svg.style.cursor = 'crosshair';
    } else if (mode === 'add-edge') {
      modeInfo.textContent = 'Mode: Click two nodes to connect';
      svg.style.cursor = 'pointer';
    } else {
      modeInfo.textContent = 'Mode: Drag nodes';
      svg.style.cursor = 'default';
    }
  }

  function disableEditing(disabled) {
    btnAddNode.disabled = disabled;
    btnAddEdge.disabled = disabled;
    btnLoadDefault.disabled = disabled;
    btnRandom.disabled = disabled;
    btnClear.disabled = disabled;
    startSelect.disabled = disabled;
    if (disabled && mode !== 'drag') {
      setMode('drag');
    }
  }

  // ───────── Graph Manipulation ─────────
  function addNode(x, y) {
    const id = nextNodeId++;
    nodes.push({ id, x, y });
    adjList[id] = [];
    rebuildAdjList();
    updateStartSelect();
    render();
    setStatus('ready', `Node ${id} added`);
    return id;
  }

  function addEdge(fromId, toId) {
    if (fromId === toId) return; // no self loops
    const exists = edges.some(
      e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    );
    if (exists) return;

    edges.push({ from: fromId, to: toId });
    rebuildAdjList();
    render();
    setStatus('ready', `Edge ${fromId}—${toId} added`);
  }

  function clearGraph() {
    resetBFS();
    nodes = [];
    edges = [];
    adjList = {};
    nextNodeId = 0;
    edgeStart = null;
    updateStartSelect();
    render();
    setStatus('ready', 'Graph cleared — add nodes or load a graph');
    setLearning('Build a graph and press <strong>Start</strong> to see step-by-step explanations of the BFS algorithm.');
  }

  function loadDefaultGraph() {
    resetBFS();
    nodes = [];
    edges = [];
    nextNodeId = 0;

    const svgRect = svg.getBoundingClientRect();
    const w = svgRect.width || 800;
    const h = svgRect.height || 450;
    const cx = w / 2;
    const cy = h / 2;

    const positions = [
      { id: 0, x: cx, y: cy - 130 },
      { id: 1, x: cx - 120, y: cy - 20 },
      { id: 2, x: cx + 120, y: cy - 20 },
      { id: 3, x: cx - 180, y: cy + 100 },
      { id: 4, x: cx - 60, y: cy + 100 },
      { id: 5, x: cx + 120, y: cy + 100 },
    ];

    for (const p of positions) {
      nodes.push({ id: p.id, x: p.x, y: p.y });
    }
    nextNodeId = 6;

    edges = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 5 },
    ];

    rebuildAdjList();
    updateStartSelect();
    startSelect.value = '0';
    render();
    setStatus('ready', 'Default 6-vertex graph loaded');
    setLearning('Default graph loaded: a tree with 6 vertices. Select a start vertex and press <strong>Start</strong> to begin BFS.');
  }

  function loadRandomGraph() {
    resetBFS();
    nodes = [];
    edges = [];
    nextNodeId = 0;

    const svgRect = svg.getBoundingClientRect();
    const w = svgRect.width || 800;
    const h = svgRect.height || 450;

    const count = 5 + Math.floor(Math.random() * 4); // 5 to 8 nodes
    const padding = 70;

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - padding;

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const jitterX = (Math.random() - 0.5) * 40;
      const jitterY = (Math.random() - 0.5) * 40;
      nodes.push({
        id: i,
        x: Math.max(NODE_RADIUS + 10, Math.min(w - NODE_RADIUS - 10, cx + Math.cos(angle) * radius + jitterX)),
        y: Math.max(NODE_RADIUS + 10, Math.min(h - NODE_RADIUS - 10, cy + Math.sin(angle) * radius + jitterY))
      });
    }
    nextNodeId = count;

    // Spanning tree to ensure connectedness
    const shuffled = [...Array(count).keys()];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 1; i < count; i++) {
      edges.push({ from: shuffled[i - 1], to: shuffled[i] });
    }

    // Add 1-3 extra random edges
    const extraCount = 1 + Math.floor(Math.random() * 3);
    for (let k = 0; k < extraCount; k++) {
      const a = Math.floor(Math.random() * count);
      const b = Math.floor(Math.random() * count);
      if (a !== b) {
        const exists = edges.some(
          e => (e.from === a && e.to === b) || (e.from === b && e.to === a)
        );
        if (!exists) edges.push({ from: a, to: b });
      }
    }

    rebuildAdjList();
    updateStartSelect();
    startSelect.value = '0';
    render();
    setStatus('ready', `Random graph with ${count} vertices generated`);
    setLearning(`Random graph generated with ${count} vertices and ${edges.length} edges. Press <strong>Start</strong> to run BFS.`);
  }

  // ───────── BFS Algorithm ─────────
  function computeBFSSteps(startId) {
    const steps = [];
    const visited = new Set();
    const queue = [];
    const traversal = [];

    // Step 1 & 2 & 3: initialize & enqueue start
    visited.add(startId);
    queue.push(startId);
    steps.push({
      type: 'init',
      vertex: startId,
      queue: [...queue],
      visited: new Set(visited),
      traversal: [...traversal],
      algoStep: 3, // "Insert it into the queue"
      message: `Starting BFS from vertex ${startId}. Mark vertex ${startId} as visited and add it to the queue.`
    });

    while (queue.length > 0) {
      const vertex = queue.shift();
      traversal.push(vertex);

      steps.push({
        type: 'dequeue',
        vertex: vertex,
        queue: [...queue],
        visited: new Set(visited),
        traversal: [...traversal],
        algoStep: 4, // "Remove the front vertex from the queue"
        message: `Dequeue vertex ${vertex} from the front of the queue. Add it to the traversal output.`
      });

      const neighbours = adjList[vertex] || [];
      let newCount = 0;

      for (const neighbour of neighbours) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push(neighbour);
          newCount++;

          steps.push({
            type: 'enqueue',
            vertex: vertex,
            neighbour: neighbour,
            edge: { from: vertex, to: neighbour },
            queue: [...queue],
            visited: new Set(visited),
            traversal: [...traversal],
            algoStep: 5, // "Add its unvisited neighbours to the queue and mark them visited"
            message: `Vertex ${neighbour} is an unvisited neighbour of vertex ${vertex}. Mark ${neighbour} as visited and add it to the queue.`
          });
        }
      }

      if (newCount === 0 && queue.length > 0) {
        steps.push({
          type: 'no-new',
          vertex: vertex,
          queue: [...queue],
          visited: new Set(visited),
          traversal: [...traversal],
          algoStep: 6, // "Repeat until the queue is empty"
          message: `Vertex ${vertex} has no unvisited neighbours. Continue to the next vertex in the queue.`
        });
      }
    }

    // Final step
    steps.push({
      type: 'complete',
      vertex: null,
      queue: [],
      visited: new Set(visited),
      traversal: [...traversal],
      algoStep: 6,
      message: `BFS complete! The queue is empty. Traversal order: ${traversal.join(' → ')}. ${visited.size < nodes.length ? `Note: ${nodes.length - visited.size} vertex(es) were not reachable from start vertex ${startId}.` : 'All reachable vertices have been visited.'}`
    });

    return steps;
  }

  // ───────── BFS Animation Step ─────────
  function applyStep(step) {
    bfsStepIndex++;

    // Update info panel
    infoStep.textContent = bfsStepIndex;
    infoCurrent.textContent = step.vertex !== null ? step.vertex : '—';
    infoVisited.textContent = [...step.visited].sort((a, b) => a - b).join(', ') || '—';

    // Update traversal sequence
    infoTraversal.innerHTML = '';
    step.traversal.forEach((v, i) => {
      if (i > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'traversal-arrow';
        arrow.textContent = '→';
        infoTraversal.appendChild(arrow);
      }
      const item = document.createElement('span');
      item.className = 'traversal-item';
      item.textContent = v;
      infoTraversal.appendChild(item);
    });
    if (step.traversal.length === 0) {
      infoTraversal.innerHTML = '<span style="color: var(--text-muted); font-style: italic; font-size: 0.82rem;">Processing…</span>';
    }

    // Update queue
    renderQueue(step.queue);

    // Update node styles
    for (const n of nodes) {
      const circle = document.getElementById(`node-circle-${n.id}`);
      if (!circle) continue;
      circle.className.baseVal = 'node-circle';

      if (step.type === 'complete') {
        if (step.visited.has(n.id)) {
          circle.className.baseVal = 'node-circle visited';
        }
      } else if (n.id === step.vertex && (step.type === 'dequeue' || step.type === 'no-new')) {
        circle.className.baseVal = 'node-circle current';
      } else if (step.type === 'enqueue' && n.id === step.neighbour) {
        circle.className.baseVal = 'node-circle queued';
      } else if (step.visited.has(n.id)) {
        circle.className.baseVal = 'node-circle visited';
      }

      // Mark start node
      if (n.id === parseInt(startSelect.value, 10) && !step.visited.has(n.id)) {
        circle.className.baseVal = 'node-circle start-node';
      }
    }

    // Reset base edges
    for (const e of edges) {
      const line = document.getElementById(`edge-${e.from}-${e.to}`);
      if (line) line.className.baseVal = 'edge-line';
    }

    // Mark all explored edges up to current step
    for (let i = 0; i < bfsStepIndex && i < bfsSteps.length; i++) {
      const s = bfsSteps[i];
      if (s.type === 'enqueue' && s.edge) {
        const eId1 = `edge-${s.edge.from}-${s.edge.to}`;
        const eId2 = `edge-${s.edge.to}-${s.edge.from}`;
        const eLine = document.getElementById(eId1) || document.getElementById(eId2);
        if (eLine) {
          eLine.className.baseVal = 'edge-line explored';
        }
      }
    }

    // Highlight active current edge
    if (step.type === 'enqueue' && step.edge) {
      const eId1 = `edge-${step.edge.from}-${step.edge.to}`;
      const eId2 = `edge-${step.edge.to}-${step.edge.from}`;
      const eLine = document.getElementById(eId1) || document.getElementById(eId2);
      if (eLine) eLine.className.baseVal = 'edge-line current-edge';
    }

    // Update status
    if (step.type === 'complete') {
      infoStatus.textContent = 'Complete';
      setStatus('done', 'BFS traversal finished');
      btnStart.disabled = true;
      btnPause.disabled = true;
      btnStep.disabled = true;
      bfsRunning = false;
      bfsComplete = true;
    } else {
      infoStatus.textContent = bfsPaused ? 'Paused' : 'Running';
    }

    // Highlight algorithm step & pseudocode
    highlightAlgoStep(step.algoStep);
    highlightPseudocode(step.type);

    // Learning mode explanation
    if (learningToggle && learningToggle.checked) {
      setLearning(step.message, true);
    }
  }

  // ───────── BFS Animation Loop ─────────
  function stepBFS() {
    if (bfsStepIndex >= bfsSteps.length) {
      bfsRunning = false;
      bfsComplete = true;
      btnStart.disabled = true;
      btnPause.disabled = true;
      btnStep.disabled = true;
      return;
    }

    applyStep(bfsSteps[bfsStepIndex]);

    if (bfsStepIndex >= bfsSteps.length) {
      bfsRunning = false;
      bfsComplete = true;
      btnStart.disabled = true;
      btnPause.disabled = true;
      btnStep.disabled = true;
    }
  }

  function runAnimation() {
    if (!bfsRunning || bfsPaused || bfsComplete) return;

    stepBFS();

    if (bfsRunning && !bfsPaused && !bfsComplete) {
      bfsTimer = setTimeout(runAnimation, getSpeed());
    }
  }

  function startBFS() {
    if (nodes.length === 0) return;

    if (bfsPaused) {
      // Resume
      bfsPaused = false;
      bfsRunning = true;
      infoStatus.textContent = 'Running';
      btnStart.disabled = true;
      btnPause.disabled = false;
      btnStep.disabled = true;
      setStatus('running', 'BFS resumed');
      runAnimation();
      return;
    }

    // Starting fresh
    resetBFSVisuals();
    const startId = parseInt(startSelect.value, 10);
    if (isNaN(startId)) return;

    bfsSteps = computeBFSSteps(startId);
    bfsStepIndex = 0;
    bfsRunning = true;
    bfsPaused = false;
    bfsComplete = false;

    disableEditing(true);
    btnStart.disabled = true;
    btnPause.disabled = false;
    btnStep.disabled = true;
    btnReset.disabled = false;
    setStatus('running', `Running BFS from vertex ${startId}...`);

    runAnimation();
  }

  function pauseBFS() {
    if (bfsRunning && !bfsPaused) {
      clearTimeout(bfsTimer);
      bfsTimer = null;
      bfsPaused = true;
      infoStatus.textContent = 'Paused';
      btnPause.disabled = true;
      btnStart.disabled = false;
      btnStart.textContent = '▶ Resume';
      btnStep.disabled = false;
      setStatus('paused', 'BFS paused');
    }
  }

  function singleStepBFS() {
    if (nodes.length === 0) return;

    if (!bfsRunning && !bfsComplete) {
      // Initialize steps if not already started
      resetBFSVisuals();
      const startId = parseInt(startSelect.value, 10);
      if (isNaN(startId)) return;

      bfsSteps = computeBFSSteps(startId);
      bfsStepIndex = 0;
      bfsRunning = true;
      bfsPaused = true;
      bfsComplete = false;

      disableEditing(true);
      btnStart.disabled = false;
      btnStart.textContent = '▶ Resume';
      btnReset.disabled = false;
      btnPause.disabled = true;
      setStatus('paused', 'BFS stepping');
    }

    stepBFS();
  }

  function resetBFSVisuals() {
    infoCurrent.textContent = '—';
    infoStep.textContent = '0';
    infoVisited.textContent = '—';
    infoStatus.textContent = 'Idle';
    infoTraversal.innerHTML = '<span style="color: var(--text-muted); font-style: italic; font-size: 0.82rem;">Run BFS to see the traversal…</span>';
    renderQueue([]);
    highlightAlgoStep(0);
    highlightPseudocode(null);

    const startId = parseInt(startSelect.value, 10);
    for (const n of nodes) {
      const circle = document.getElementById(`node-circle-${n.id}`);
      if (circle) {
        circle.className.baseVal = 'node-circle' + (n.id === startId ? ' start-node' : '');
      }
    }
    for (const e of edges) {
      const line = document.getElementById(`edge-${e.from}-${e.to}`);
      if (line) line.className.baseVal = 'edge-line';
    }
  }

  function resetBFS() {
    clearTimeout(bfsTimer);
    bfsTimer = null;
    bfsRunning = false;
    bfsPaused = false;
    bfsComplete = false;
    bfsSteps = [];
    bfsStepIndex = 0;

    resetBFSVisuals();
    disableEditing(false);
    updateStartSelect();

    btnStart.disabled = nodes.length === 0;
    btnStart.textContent = '▶ Start';
    btnPause.disabled = true;
    btnStep.disabled = nodes.length === 0;
    btnReset.disabled = true;

    setStatus('ready', 'Ready — add nodes or load a graph');
    setLearning('Build a graph and press <strong>Start</strong> to see step-by-step explanations of the BFS algorithm.');
  }

  // ───────── Event Listeners ─────────

  // SVG Mouse Interaction
  svg.addEventListener('mousedown', (e) => {
    const pt = getSvgPoint(e);
    const clickedNode = findNodeAt(pt.x, pt.y);

    if (mode === 'add-node') {
      if (!clickedNode) {
        addNode(pt.x, pt.y);
      }
      return;
    }

    if (mode === 'add-edge') {
      if (clickedNode) {
        if (edgeStart === null) {
          edgeStart = clickedNode.id;
          const circle = document.getElementById(`node-circle-${edgeStart}`);
          if (circle) circle.classList.add('selected');
          modeInfo.textContent = `Mode: Connect vertex ${edgeStart} → click target`;
        } else {
          if (edgeStart !== clickedNode.id) {
            addEdge(edgeStart, clickedNode.id);
          }
          const prevCircle = document.getElementById(`node-circle-${edgeStart}`);
          if (prevCircle) prevCircle.classList.remove('selected');
          edgeStart = null;
          modeInfo.textContent = 'Mode: Click two nodes to connect';
        }
      } else {
        if (edgeStart !== null) {
          const prevCircle = document.getElementById(`node-circle-${edgeStart}`);
          if (prevCircle) prevCircle.classList.remove('selected');
          edgeStart = null;
          modeInfo.textContent = 'Mode: Click two nodes to connect';
        }
      }
      return;
    }

    // Drag mode
    if (clickedNode) {
      dragging = {
        nodeId: clickedNode.id,
        offsetX: pt.x - clickedNode.x,
        offsetY: pt.y - clickedNode.y
      };
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const pt = getSvgPoint(e);
    const node = nodes.find(n => n.id === dragging.nodeId);
    if (!node) return;

    const svgRect = svg.getBoundingClientRect();
    const w = svgRect.width || 800;
    const h = svgRect.height || 450;

    node.x = Math.max(NODE_RADIUS + 4, Math.min(w - NODE_RADIUS - 4, pt.x - dragging.offsetX));
    node.y = Math.max(NODE_RADIUS + 4, Math.min(h - NODE_RADIUS - 4, pt.y - dragging.offsetY));

    updateNodeElementPosition(node);
  });

  window.addEventListener('mouseup', () => {
    dragging = null;
  });

  // Buttons
  btnAddNode.addEventListener('click', () => setMode('add-node'));
  btnAddEdge.addEventListener('click', () => setMode('add-edge'));
  btnLoadDefault.addEventListener('click', loadDefaultGraph);
  btnRandom.addEventListener('click', loadRandomGraph);
  btnClear.addEventListener('click', clearGraph);
  btnStart.addEventListener('click', startBFS);
  btnPause.addEventListener('click', pauseBFS);
  btnStep.addEventListener('click', singleStepBFS);
  btnReset.addEventListener('click', resetBFS);

  // Speed slider
  speedSlider.addEventListener('input', () => {
    speedLabel.textContent = (getSpeed() / 1000).toFixed(1) + 's';
  });

  // Start vertex select
  startSelect.addEventListener('change', () => {
    if (bfsRunning || bfsComplete) {
      resetBFS();
    } else {
      const selectedId = parseInt(startSelect.value, 10);
      for (const n of nodes) {
        const circle = document.getElementById(`node-circle-${n.id}`);
        if (circle) {
          circle.className.baseVal = 'node-circle' + (n.id === selectedId ? ' start-node' : '');
        }
      }
    }
  });

  // Learning toggle
  if (learningToggle && learningMsg) {
    learningToggle.addEventListener('change', () => {
      learningMsg.style.display = learningToggle.checked ? 'block' : 'none';
    });
  }

  // ───────── Initialization ─────────
  setupPseudocode();
  speedLabel.textContent = (getSpeed() / 1000).toFixed(1) + 's';
  loadDefaultGraph();

})();
